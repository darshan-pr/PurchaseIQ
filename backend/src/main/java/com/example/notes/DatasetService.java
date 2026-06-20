package com.example.notes;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DatasetService {
    private static final List<String> REQUIRED_COLUMNS = List.of(
            "CustomerID", "Age", "Gender", "Product", "Category", "Quantity", "Price", "PurchaseDate");

    private final DatasetRepository datasetRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DatasetImportIssueRepository issueRepository;
    private final DatasetAnalyticsRepository analyticsRepository;
    private final AnalyticsService analyticsService;
    private final Path uploadDirectory;

    public DatasetService(
            DatasetRepository datasetRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PurchaseOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            DatasetImportIssueRepository issueRepository,
            DatasetAnalyticsRepository analyticsRepository,
            AnalyticsService analyticsService,
            @Value("${app.upload-dir:uploads}") String uploadDirectory) {
        this.datasetRepository = datasetRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.issueRepository = issueRepository;
        this.analyticsRepository = analyticsRepository;
        this.analyticsService = analyticsService;
        this.uploadDirectory = Path.of(uploadDirectory);
    }

    @Transactional
    public DatasetUploadResponse upload(MultipartFile file) {
        validateFile(file);
        String originalFileName = safeFileName(file.getOriginalFilename());
        List<List<String>> rows = parseCsv(file);
        if (rows.isEmpty()) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Dataset empty");
        }

        Map<String, Integer> header = validateHeader(rows.get(0));
        if (rows.size() == 1) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Dataset empty");
        }

        int version = nextVersion();
        Dataset dataset = new Dataset();
        dataset.setDatasetName(stripCsvExtension(originalFileName));
        dataset.setFileName(originalFileName);
        dataset.setVersionNumber(version);
        dataset.setStatus(DatasetStatus.UPLOADED);
        dataset = datasetRepository.save(dataset);

        storeUploadedFile(file, version);
        dataset.setStatus(DatasetStatus.PROCESSING);
        dataset = datasetRepository.save(dataset);

        ProcessingResult result = processRows(dataset, rows, header);
        if (result.validRows == 0) {
            dataset.setStatus(DatasetStatus.FAILED);
            datasetRepository.save(dataset);
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Dataset contains no valid records");
        }

        archiveActiveDatasets();
        dataset.setRecordCount(result.validRows);
        dataset.setActive(true);
        dataset.setStatus(DatasetStatus.COMPLETED);
        datasetRepository.save(dataset);
        analyticsService.computeAndStore(dataset);

        return new DatasetUploadResponse(
                dataset.getId(),
                dataset.getVersionNumber(),
                dataset.getStatus(),
                dataset.getRecordCount(),
                result.issueCount);
    }

    @Transactional(readOnly = true)
    public List<DatasetSummary> listDatasets() {
        return datasetRepository.findAllByOrderByVersionNumberDesc().stream()
                .map(dataset -> DatasetSummary.from(dataset, issueRepository.countByDatasetId(dataset.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DatasetDetail getDataset(Long id) {
        Dataset dataset = datasetRepository
                .findById(id)
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "Dataset not found"));
        return DatasetDetail.from(
                dataset,
                issueRepository.countByDatasetId(id),
                issueRepository.findTop10ByDatasetIdOrderByRowNumberAsc(id));
    }

    @Transactional(readOnly = true)
    public DatasetSummary getActiveDataset() {
        Dataset dataset = datasetRepository
                .findByActiveTrue()
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "No active dataset found"));
        return DatasetSummary.from(dataset, issueRepository.countByDatasetId(dataset.getId()));
    }

    @Transactional
    public DatasetSummary activateDataset(Long id) {
        Dataset dataset = datasetRepository
                .findById(id)
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "Dataset not found"));
        if (dataset.getStatus() != DatasetStatus.COMPLETED && dataset.getStatus() != DatasetStatus.ARCHIVED) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Only completed datasets can be activated");
        }
        archiveActiveDatasets();
        dataset.setStatus(DatasetStatus.COMPLETED);
        dataset.setActive(true);
        Dataset saved = datasetRepository.save(dataset);
        analyticsService.computeAndStore(saved);
        return DatasetSummary.from(saved, issueRepository.countByDatasetId(saved.getId()));
    }

    @Transactional
    public void deleteDataset(Long id) {
        Dataset dataset = datasetRepository
                .findById(id)
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "Dataset not found"));
        boolean wasActive = dataset.isActive();
        int deletedVersion = dataset.getVersionNumber();

        analyticsRepository.deleteByDatasetId(id);
        issueRepository.deleteByDatasetId(id);
        orderItemRepository.deleteByDatasetId(id);
        orderRepository.deleteByDatasetId(id);
        productRepository.deleteByDatasetId(id);
        customerRepository.deleteByDatasetId(id);
        datasetRepository.delete(dataset);
        datasetRepository.flush();
        deleteUploadedFile(deletedVersion);

        if (wasActive) {
            datasetRepository.findAllByOrderByVersionNumberDesc().stream()
                    .filter(candidate -> candidate.getStatus() == DatasetStatus.COMPLETED
                            || candidate.getStatus() == DatasetStatus.ARCHIVED)
                    .findFirst()
                    .ifPresent(candidate -> {
                        candidate.setStatus(DatasetStatus.COMPLETED);
                        candidate.setActive(true);
                        Dataset saved = datasetRepository.save(candidate);
                        analyticsService.computeAndStore(saved);
                    });
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Dataset empty");
        }
        String fileName = safeFileName(file.getOriginalFilename());
        if (!fileName.toLowerCase(Locale.ROOT).endsWith(".csv")) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Only CSV files are supported");
        }
    }

    private List<List<String>> parseCsv(MultipartFile file) {
        try {
            String csv = new String(file.getBytes(), StandardCharsets.UTF_8);
            List<List<String>> rows = new ArrayList<>();
            for (String line : csv.split("\\R", -1)) {
                if (line.isBlank()) {
                    continue;
                }
                rows.add(parseLine(line));
            }
            return rows;
        } catch (IOException exception) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Unable to process dataset");
        }
    }

    private List<String> parseLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int index = 0; index < line.length(); index++) {
            char ch = line.charAt(index);
            if (ch == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    quoted = !quoted;
                }
            } else if (ch == ',' && !quoted) {
                values.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        values.add(current.toString().trim());
        return values;
    }

    private Map<String, Integer> validateHeader(List<String> columns) {
        Map<String, Integer> header = new LinkedHashMap<>();
        for (int index = 0; index < columns.size(); index++) {
            header.put(normalize(columns.get(index)), index);
        }

        List<String> missing = REQUIRED_COLUMNS.stream()
                .filter(column -> !header.containsKey(normalize(column)))
                .toList();
        if (!missing.isEmpty()) {
            throw new DatasetUploadException(
                    HttpStatus.BAD_REQUEST, "Required columns missing: " + String.join(", ", missing));
        }
        return header;
    }

    private ProcessingResult processRows(Dataset dataset, List<List<String>> rows, Map<String, Integer> header) {
        Map<String, Customer> customers = new HashMap<>();
        Map<String, Product> products = new HashMap<>();
        List<PurchaseOrder> orders = new ArrayList<>();
        List<OrderItem> orderItems = new ArrayList<>();
        List<DatasetImportIssue> issues = new ArrayList<>();
        Set<String> seenRows = new HashSet<>();
        long validRows = 0;

        for (int rowIndex = 1; rowIndex < rows.size(); rowIndex++) {
            List<String> row = rows.get(rowIndex);
            String rawRow = String.join(",", row);
            if (!seenRows.add(rawRow)) {
                issues.add(new DatasetImportIssue(dataset, rowIndex + 1, "Duplicate row skipped", rawRow));
                continue;
            }

            try {
                String customerId = value(row, header, "CustomerID");
                int age = parseInteger(value(row, header, "Age"), "Age");
                String gender = value(row, header, "Gender");
                String productName = value(row, header, "Product");
                String category = value(row, header, "Category");
                int quantity = parseInteger(value(row, header, "Quantity"), "Quantity");
                BigDecimal price = parseMoney(value(row, header, "Price"), "Price");
                LocalDate purchaseDate = parseDate(value(row, header, "PurchaseDate"));
                String city = optionalValue(row, header, "City");
                String productId = optionalValue(row, header, "ProductID");
                if (productId.isBlank()) {
                    productId = stableProductId(productName, category);
                }
                String orderId = optionalValue(row, header, "OrderID");
                if (orderId.isBlank()) {
                    orderId = "ORD-" + dataset.getVersionNumber() + "-" + (rowIndex + 1);
                }

                validateBusinessValues(customerId, age, gender, productName, category, quantity, price);

                customers.putIfAbsent(customerId, new Customer(dataset, customerId, age, gender, city));
                products.putIfAbsent(productId, new Product(dataset, productId, productName, category, price));
                orders.add(new PurchaseOrder(dataset, orderId, customerId, purchaseDate, price.multiply(BigDecimal.valueOf(quantity))));
                orderItems.add(new OrderItem(dataset, orderId, productId, quantity));
                validRows++;
            } catch (IllegalArgumentException exception) {
                issues.add(new DatasetImportIssue(dataset, rowIndex + 1, exception.getMessage(), rawRow));
            }
        }

        customerRepository.saveAll(customers.values());
        productRepository.saveAll(products.values());
        orderRepository.saveAll(orders);
        orderItemRepository.saveAll(orderItems);
        issueRepository.saveAll(issues);
        return new ProcessingResult(validRows, issues.size());
    }

    private void archiveActiveDatasets() {
        for (Dataset activeDataset : datasetRepository.findAllByActiveTrue()) {
            activeDataset.setActive(false);
            activeDataset.setStatus(DatasetStatus.ARCHIVED);
            datasetRepository.save(activeDataset);
        }
    }

    private int nextVersion() {
        return datasetRepository
                        .findTopByOrderByVersionNumberDesc()
                        .map(Dataset::getVersionNumber)
                        .orElse(0)
                + 1;
    }

    private void storeUploadedFile(MultipartFile file, int version) {
        try {
            Files.createDirectories(uploadDirectory);
            Path target = uploadDirectory.resolve("dataset_v" + version + ".csv").normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Unable to process dataset");
        }
    }

    private void deleteUploadedFile(int version) {
        try {
            Files.deleteIfExists(uploadDirectory.resolve("dataset_v" + version + ".csv").normalize());
        } catch (IOException exception) {
            throw new DatasetUploadException(HttpStatus.BAD_REQUEST, "Unable to delete dataset file");
        }
    }

    private String value(List<String> row, Map<String, Integer> header, String column) {
        String value = optionalValue(row, header, column);
        if (value.isBlank()) {
            throw new IllegalArgumentException(column + " is required");
        }
        return value;
    }

    private String optionalValue(List<String> row, Map<String, Integer> header, String column) {
        Integer index = header.get(normalize(column));
        if (index == null || index >= row.size()) {
            return "";
        }
        return row.get(index).trim();
    }

    private int parseInteger(String value, String column) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(column + " must be a number");
        }
    }

    private BigDecimal parseMoney(String value, String column) {
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(column + " must be a number");
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Invalid Purchase Date");
        }
    }

    private void validateBusinessValues(
            String customerId,
            int age,
            String gender,
            String productName,
            String category,
            int quantity,
            BigDecimal price) {
        if (customerId.isBlank() || gender.isBlank() || productName.isBlank() || category.isBlank()) {
            throw new IllegalArgumentException("Required field is blank");
        }
        if (age < 0) {
            throw new IllegalArgumentException("Age must be greater than or equal to 0");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity must be greater than or equal to 0");
        }
        if (price.signum() < 0) {
            throw new IllegalArgumentException("Price must be greater than or equal to 0");
        }
    }

    private String stableProductId(String productName, String category) {
        return normalize(category + "-" + productName).replaceAll("[^a-z0-9]+", "-");
    }

    private String safeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "dataset.csv";
        }
        return Path.of(fileName).getFileName().toString();
    }

    private String stripCsvExtension(String fileName) {
        return fileName.replaceFirst("(?i)\\.csv$", "");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private record ProcessingResult(long validRows, long issueCount) {}
}

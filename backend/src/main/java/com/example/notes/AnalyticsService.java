package com.example.notes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {
    private final DatasetRepository datasetRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DatasetAnalyticsRepository analyticsRepository;
    private final ObjectMapper objectMapper;

    public AnalyticsService(
            DatasetRepository datasetRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PurchaseOrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            DatasetAnalyticsRepository analyticsRepository,
            ObjectMapper objectMapper) {
        this.datasetRepository = datasetRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.analyticsRepository = analyticsRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AnalyticsPayload computeAndStore(Dataset dataset) {
        AnalyticsPayload payload = compute(dataset);
        String payloadJson = toJson(payload);
        DatasetAnalytics analytics = analyticsRepository
                .findByDatasetId(dataset.getId())
                .orElseGet(() -> new DatasetAnalytics(dataset, payloadJson));
        analytics.setPayloadJson(payloadJson);
        analyticsRepository.save(analytics);
        return payload;
    }

    @Transactional(readOnly = true)
    public AnalyticsPayload getActiveAnalytics() {
        Dataset dataset = datasetRepository
                .findByActiveTrue()
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "No active dataset found"));
        return analyticsRepository
                .findByDatasetId(dataset.getId())
                .map(DatasetAnalytics::getPayloadJson)
                .map(this::fromJson)
                .orElseThrow(() -> new DatasetUploadException(HttpStatus.NOT_FOUND, "Analytics not computed for active dataset"));
    }

    private AnalyticsPayload compute(Dataset dataset) {
        long datasetId = dataset.getId();
        List<Customer> customers = customerRepository.findAllByDatasetId(datasetId);
        List<Product> products = productRepository.findAllByDatasetId(datasetId);
        List<PurchaseOrder> orders = orderRepository.findAllByDatasetId(datasetId);
        List<OrderItem> items = orderItemRepository.findAllByDatasetId(datasetId);

        Map<String, Customer> customersById = customers.stream()
                .collect(Collectors.toMap(Customer::getCustomerId, Function.identity(), (first, second) -> first));
        Map<String, Product> productsById = products.stream()
                .collect(Collectors.toMap(Product::getProductId, Function.identity(), (first, second) -> first));
        Map<String, PurchaseOrder> ordersById = orders.stream()
                .collect(Collectors.toMap(PurchaseOrder::getOrderId, Function.identity(), (first, second) -> first));

        Map<String, List<PurchaseOrder>> ordersByCustomer = orders.stream()
                .collect(Collectors.groupingBy(PurchaseOrder::getCustomerId));
        Map<String, BigDecimal> spendByCustomer = new HashMap<>();
        for (PurchaseOrder order : orders) {
            spendByCustomer.merge(order.getCustomerId(), order.getTotalAmount(), BigDecimal::add);
        }

        List<AnalyticsPayload.CustomerRow> customerRows = customers.stream()
                .map(customer -> {
                    List<PurchaseOrder> customerOrders = ordersByCustomer.getOrDefault(customer.getCustomerId(), List.of());
                    BigDecimal spend = spendByCustomer.getOrDefault(customer.getCustomerId(), BigDecimal.ZERO);
                    return new AnalyticsPayload.CustomerRow(
                            customer.getCustomerId(),
                            customer.getAge(),
                            customer.getGender(),
                            customer.getCity(),
                            money(spend),
                            customerOrders.size(),
                            average(spend, customerOrders.size()));
                })
                .sorted(Comparator.comparing(AnalyticsPayload.CustomerRow::totalSpend).reversed())
                .toList();

        List<AnalyticsPayload.TopCustomer> topCustomers = customerRows.stream()
                .limit(10)
                .map(row -> new AnalyticsPayload.TopCustomer(
                        row.customerId(), row.totalSpend(), row.orderCount(), row.averageOrderValue()))
                .toList();

        Map<String, BigDecimal> revenueByProduct = new HashMap<>();
        Map<String, Long> quantityByProduct = new HashMap<>();
        Map<String, Set<String>> buyersByProduct = new HashMap<>();
        Map<String, Map<String, Long>> ageGroupsByProduct = new HashMap<>();
        Map<String, Map<String, Long>> gendersByProduct = new HashMap<>();

        for (OrderItem item : items) {
            Product product = productsById.get(item.getProductId());
            PurchaseOrder order = ordersById.get(item.getOrderId());
            if (product == null || order == null) {
                continue;
            }
            BigDecimal revenue = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            revenueByProduct.merge(product.getProductId(), revenue, BigDecimal::add);
            quantityByProduct.merge(product.getProductId(), item.getQuantity().longValue(), Long::sum);
            buyersByProduct.computeIfAbsent(product.getProductId(), key -> new HashSet<>()).add(order.getCustomerId());

            Customer customer = customersById.get(order.getCustomerId());
            if (customer != null) {
                increment(ageGroupsByProduct.computeIfAbsent(product.getProductId(), key -> new HashMap<>()), ageGroup(customer.getAge()));
                increment(gendersByProduct.computeIfAbsent(product.getProductId(), key -> new HashMap<>()), customer.getGender());
            }
        }

        List<AnalyticsPayload.ProductRow> productRows = products.stream()
                .map(product -> new AnalyticsPayload.ProductRow(
                        product.getProductId(),
                        product.getProductName(),
                        product.getCategory(),
                        money(product.getPrice()),
                        money(revenueByProduct.getOrDefault(product.getProductId(), BigDecimal.ZERO)),
                        quantityByProduct.getOrDefault(product.getProductId(), 0L),
                        buyersByProduct.getOrDefault(product.getProductId(), Set.of()).size()))
                .sorted(Comparator.comparing(AnalyticsPayload.ProductRow::revenue).reversed())
                .toList();

        BigDecimal totalRevenue = orders.stream()
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalUnits = items.stream().mapToLong(OrderItem::getQuantity).sum();

        List<AnalyticsPayload.CustomerInsight> customerInsights = customerRows.stream()
                .map(row -> customerInsight(row, ordersByCustomer, items, ordersById, productsById))
                .toList();

        List<AnalyticsPayload.ProductInsight> productInsights = productRows.stream()
                .map(row -> new AnalyticsPayload.ProductInsight(
                        row.productId(),
                        row.productName(),
                        row.category(),
                        row.revenue(),
                        row.buyers(),
                        topLabel(ageGroupsByProduct.getOrDefault(row.productId(), Map.of())),
                        topLabel(gendersByProduct.getOrDefault(row.productId(), Map.of())),
                        percentage(row.revenue(), totalRevenue)))
                .toList();

        AnalyticsPayload.CustomerAnalytics customerAnalytics = new AnalyticsPayload.CustomerAnalytics(
                customerRows,
                distribution(customers, customer -> ageGroup(customer.getAge())),
                distribution(customers, Customer::getGender),
                spendingDistribution(customerRows),
                purchaseFrequency(customerRows));

        AnalyticsPayload.ProductAnalytics productAnalytics = new AnalyticsPayload.ProductAnalytics(
                productRows,
                productRows.stream().limit(10).toList(),
                productRows.stream()
                        .limit(10)
                        .map(row -> new AnalyticsPayload.DistributionPoint(row.productName(), row.quantitySold()))
                        .toList(),
                moneyByLabel(productRows, AnalyticsPayload.ProductRow::category, AnalyticsPayload.ProductRow::revenue),
                productRows.stream()
                        .limit(10)
                        .map(row -> new AnalyticsPayload.MoneyPoint(row.productName(), row.revenue()))
                        .toList());

        AnalyticsPayload.PurchaseAnalytics purchaseAnalytics = new AnalyticsPayload.PurchaseAnalytics(
                trendByDay(orders),
                trendByMonth(orders),
                trendByDay(orders),
                trendByDay(orders).stream()
                        .map(point -> new AnalyticsPayload.DistributionPoint(point.date(), point.orders()))
                        .toList());

        AnalyticsPayload.Overview overview = new AnalyticsPayload.Overview(
                customers.size(),
                orders.size(),
                money(totalRevenue),
                average(totalRevenue, orders.size()),
                products.size(),
                totalUnits);

        return new AnalyticsPayload(
                dataset.getId(),
                dataset.getVersionNumber(),
                Instant.now(),
                overview,
                customerAnalytics,
                productAnalytics,
                purchaseAnalytics,
                topCustomers,
                customerInsights,
                productInsights);
    }

    private AnalyticsPayload.CustomerInsight customerInsight(
            AnalyticsPayload.CustomerRow row,
            Map<String, List<PurchaseOrder>> ordersByCustomer,
            List<OrderItem> items,
            Map<String, PurchaseOrder> ordersById,
            Map<String, Product> productsById) {
        Set<String> orderIds = ordersByCustomer.getOrDefault(row.customerId(), List.of()).stream()
                .map(PurchaseOrder::getOrderId)
                .collect(Collectors.toSet());
        Map<String, Long> productCounts = new HashMap<>();
        Map<String, Long> categoryCounts = new HashMap<>();
        for (OrderItem item : items) {
            PurchaseOrder order = ordersById.get(item.getOrderId());
            Product product = productsById.get(item.getProductId());
            if (order == null || product == null || !orderIds.contains(order.getOrderId())) {
                continue;
            }
            productCounts.merge(product.getProductName(), item.getQuantity().longValue(), Long::sum);
            categoryCounts.merge(product.getCategory(), item.getQuantity().longValue(), Long::sum);
        }
        return new AnalyticsPayload.CustomerInsight(
                row.customerId(),
                row.age(),
                row.gender(),
                row.city(),
                topLabel(productCounts),
                topLabel(categoryCounts),
                row.totalSpend(),
                row.orderCount(),
                customerType(row.orderCount()));
    }

    private List<AnalyticsPayload.TrendPoint> trendByDay(List<PurchaseOrder> orders) {
        Map<String, List<PurchaseOrder>> grouped = orders.stream()
                .collect(Collectors.groupingBy(order -> order.getPurchaseDate().toString(), LinkedHashMap::new, Collectors.toList()));
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> trendPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<AnalyticsPayload.TrendPoint> trendByMonth(List<PurchaseOrder> orders) {
        Map<String, List<PurchaseOrder>> grouped = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> YearMonth.from(order.getPurchaseDate()).toString(), LinkedHashMap::new, Collectors.toList()));
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> trendPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private AnalyticsPayload.TrendPoint trendPoint(String label, List<PurchaseOrder> orders) {
        BigDecimal revenue = orders.stream()
                .map(PurchaseOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new AnalyticsPayload.TrendPoint(label, money(revenue), orders.size());
    }

    private <T> List<AnalyticsPayload.DistributionPoint> distribution(List<T> rows, Function<T, String> labeler) {
        return rows.stream()
                .collect(Collectors.groupingBy(labeler, Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new AnalyticsPayload.DistributionPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<AnalyticsPayload.MoneyPoint> moneyByLabel(
            List<AnalyticsPayload.ProductRow> rows,
            Function<AnalyticsPayload.ProductRow, String> labeler,
            Function<AnalyticsPayload.ProductRow, BigDecimal> valueExtractor) {
        Map<String, BigDecimal> values = new HashMap<>();
        for (AnalyticsPayload.ProductRow row : rows) {
            values.merge(labeler.apply(row), valueExtractor.apply(row), BigDecimal::add);
        }
        return values.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .map(entry -> new AnalyticsPayload.MoneyPoint(entry.getKey(), money(entry.getValue())))
                .toList();
    }

    private List<AnalyticsPayload.MoneyPoint> spendingDistribution(List<AnalyticsPayload.CustomerRow> rows) {
        Map<String, BigDecimal> values = new LinkedHashMap<>();
        values.put("0-99", BigDecimal.ZERO);
        values.put("100-249", BigDecimal.ZERO);
        values.put("250-499", BigDecimal.ZERO);
        values.put("500+", BigDecimal.ZERO);
        for (AnalyticsPayload.CustomerRow row : rows) {
            String bucket = row.totalSpend().compareTo(BigDecimal.valueOf(100)) < 0
                    ? "0-99"
                    : row.totalSpend().compareTo(BigDecimal.valueOf(250)) < 0
                            ? "100-249"
                            : row.totalSpend().compareTo(BigDecimal.valueOf(500)) < 0 ? "250-499" : "500+";
            values.merge(bucket, BigDecimal.ONE, BigDecimal::add);
        }
        return values.entrySet().stream()
                .map(entry -> new AnalyticsPayload.MoneyPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<AnalyticsPayload.DistributionPoint> purchaseFrequency(List<AnalyticsPayload.CustomerRow> rows) {
        Map<String, Long> values = new LinkedHashMap<>();
        values.put("Rare", 0L);
        values.put("Occasional", 0L);
        values.put("Frequent", 0L);
        for (AnalyticsPayload.CustomerRow row : rows) {
            values.merge(customerType(row.orderCount()), 1L, Long::sum);
        }
        return values.entrySet().stream()
                .map(entry -> new AnalyticsPayload.DistributionPoint(entry.getKey(), entry.getValue()))
                .toList();
    }

    private String ageGroup(Integer age) {
        if (age == null) {
            return "Unknown";
        }
        if (age < 25) {
            return "18-24";
        }
        if (age < 35) {
            return "25-34";
        }
        if (age < 45) {
            return "35-44";
        }
        if (age < 55) {
            return "45-54";
        }
        return "55+";
    }

    private String customerType(long orderCount) {
        if (orderCount >= 5) {
            return "Frequent";
        }
        if (orderCount >= 2) {
            return "Occasional";
        }
        return "Rare";
    }

    private void increment(Map<String, Long> map, String key) {
        map.merge(key, 1L, Long::sum);
    }

    private String topLabel(Map<String, Long> values) {
        return values.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }

    private BigDecimal average(BigDecimal total, long count) {
        if (count == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return total.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal percentage(BigDecimal value, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String toJson(AnalyticsPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize analytics", exception);
        }
    }

    private AnalyticsPayload fromJson(String json) {
        try {
            return objectMapper.readValue(json, AnalyticsPayload.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to read analytics", exception);
        }
    }
}

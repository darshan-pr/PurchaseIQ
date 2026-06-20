package com.example.notes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DatasetControllerTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private DatasetAnalyticsRepository analyticsRepository;

    @Autowired
    private DatasetRepository datasetRepository;

    @Autowired
    private DatasetImportIssueRepository issueRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseOrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @BeforeEach
    void cleanDatabase() {
        analyticsRepository.deleteAll();
        issueRepository.deleteAll();
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
        datasetRepository.deleteAll();
    }

    @Test
    void uploadsValidDatasetAndCreatesActiveCompletedVersion() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("customers.csv", validCsv())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.recordCount").value(2))
                .andExpect(jsonPath("$.issueCount").value(0));

        mvc.perform(get("/api/datasets/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));

        assertThat(customerRepository.count()).isEqualTo(2);
        assertThat(productRepository.count()).isEqualTo(2);
        assertThat(orderRepository.count()).isEqualTo(2);
        assertThat(orderItemRepository.count()).isEqualTo(2);
    }

    @Test
    void rejectsInvalidFileExtension() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("customers.xlsx", validCsv())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Only CSV files are supported"));

        assertThat(datasetRepository.count()).isZero();
    }

    @Test
    void rejectsMissingRequiredColumn() throws Exception {
        String missingPurchaseDate = """
                CustomerID,Age,Gender,Product,Category,Quantity,Price
                C001,31,Female,Laptop,Electronics,1,700
                """;

        mvc.perform(multipart("/api/datasets/upload").file(csv("customers.csv", missingPurchaseDate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Required columns missing: PurchaseDate"));
    }

    @Test
    void rejectsEmptyDataset() throws Exception {
        String headerOnly = "CustomerID,Age,Gender,Product,Category,Quantity,Price,PurchaseDate\n";

        mvc.perform(multipart("/api/datasets/upload").file(csv("customers.csv", headerOnly)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Dataset empty"));
    }

    @Test
    void uploadsNewVersionAndArchivesPreviousActiveDataset() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("first.csv", validCsv())))
                .andExpect(status().isCreated());

        mvc.perform(multipart("/api/datasets/upload").file(csv("second.csv", validCsv())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(2));

        assertThat(datasetRepository.findAllByOrderByVersionNumberDesc())
                .extracting(Dataset::getStatus)
                .containsExactly(DatasetStatus.COMPLETED, DatasetStatus.ARCHIVED);

        mvc.perform(get("/api/datasets/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2));
    }

    @Test
    void canActivateArchivedDatasetVersion() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("first.csv", validCsv())))
                .andExpect(status().isCreated());
        mvc.perform(multipart("/api/datasets/upload").file(csv("second.csv", validCsv())))
                .andExpect(status().isCreated());

        Long versionOneId = datasetRepository.findAllByOrderByVersionNumberDesc().get(1).getId();

        mvc.perform(put("/api/datasets/" + versionOneId + "/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void deletesDatasetAndRelatedAnalytics() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("first.csv", validCsv())))
                .andExpect(status().isCreated());
        mvc.perform(multipart("/api/datasets/upload").file(csv("second.csv", validCsv())))
                .andExpect(status().isCreated());

        Long versionTwoId = datasetRepository.findAllByOrderByVersionNumberDesc().get(0).getId();

        mvc.perform(delete("/api/datasets/" + versionTwoId))
                .andExpect(status().isNoContent());

        assertThat(datasetRepository.existsById(versionTwoId)).isFalse();
        assertThat(analyticsRepository.findByDatasetId(versionTwoId)).isEmpty();
        assertThat(customerRepository.findAllByDatasetId(versionTwoId)).isEmpty();
        assertThat(productRepository.findAllByDatasetId(versionTwoId)).isEmpty();
        assertThat(orderRepository.findAllByDatasetId(versionTwoId)).isEmpty();
        assertThat(orderItemRepository.findAllByDatasetId(versionTwoId)).isEmpty();

        mvc.perform(get("/api/datasets/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1));
    }

    @Test
    void logsInvalidRowsAndImportsValidRows() throws Exception {
        String mixedCsv = """
                CustomerID,Age,Gender,Product,Category,Quantity,Price,PurchaseDate
                C001,31,Female,Laptop,Electronics,1,700,2026-01-15
                C002,-10,Male,Mouse,Electronics,2,20,2026-01-16
                C003,25,Female,Keyboard,Electronics,-2,50,2026-01-17
                C004,34,Male,Desk,Furniture,1,-500,2026-01-18
                C005,28,Female,Chair,Furniture,1,120,not-a-date
                """;

        mvc.perform(multipart("/api/datasets/upload").file(csv("mixed.csv", mixedCsv)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recordCount").value(1))
                .andExpect(jsonPath("$.issueCount").value(4));

        Dataset dataset = datasetRepository.findByActiveTrue().orElseThrow();
        mvc.perform(get("/api/datasets/" + dataset.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.issueCount").value(4))
                .andExpect(jsonPath("$.issues[0].rowNumber").value(3));
    }

    private MockMultipartFile csv(String fileName, String content) {
        return new MockMultipartFile("file", fileName, "text/csv", content.getBytes());
    }

    private String validCsv() {
        return """
                CustomerID,Age,Gender,City,Product,Category,Quantity,Price,PurchaseDate
                C001,31,Female,Mumbai,Laptop,Electronics,1,700,2026-01-15
                C002,28,Male,Pune,Chair,Furniture,2,120,2026-01-16
                """;
    }
}

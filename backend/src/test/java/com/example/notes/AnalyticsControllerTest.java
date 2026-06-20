package com.example.notes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
class AnalyticsControllerTest {
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
    void returnsCachedAnalyticsForActiveDataset() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("analytics.csv", """
                CustomerID,Age,Gender,City,Product,Category,Quantity,Price,PurchaseDate
                C001,31,Female,Mumbai,Laptop,Electronics,1,700,2026-01-15
                C001,31,Female,Mumbai,Mouse,Electronics,2,20,2026-01-16
                C002,28,Male,Pune,Chair,Furniture,2,120,2026-01-16
                """))).andExpect(status().isCreated());

        assertThat(analyticsRepository.count()).isEqualTo(1);

        mvc.perform(get("/api/analytics/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.overview.totalCustomers").value(2))
                .andExpect(jsonPath("$.overview.totalOrders").value(3))
                .andExpect(jsonPath("$.overview.totalRevenue").value(980.00))
                .andExpect(jsonPath("$.topCustomers[0].customerId").value("C001"))
                .andExpect(jsonPath("$.productAnalytics.topProducts[0].productName").value("Laptop"))
                .andExpect(jsonPath("$.customerInsights[0].customerType").value("Occasional"));
    }

    @Test
    void activeAnalyticsFollowActiveDatasetVersion() throws Exception {
        mvc.perform(multipart("/api/datasets/upload").file(csv("v1.csv", """
                CustomerID,Age,Gender,Product,Category,Quantity,Price,PurchaseDate
                C001,31,Female,Laptop,Electronics,1,700,2026-01-15
                """))).andExpect(status().isCreated());

        mvc.perform(multipart("/api/datasets/upload").file(csv("v2.csv", """
                CustomerID,Age,Gender,Product,Category,Quantity,Price,PurchaseDate
                C010,22,Male,Shoes,Footwear,3,80,2026-02-15
                C011,45,Female,Bag,Accessories,1,150,2026-02-16
                """))).andExpect(status().isCreated());

        assertThat(analyticsRepository.count()).isEqualTo(2);

        mvc.perform(get("/api/analytics/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.overview.totalCustomers").value(2))
                .andExpect(jsonPath("$.overview.totalRevenue").value(390.00));
    }

    private MockMultipartFile csv(String fileName, String content) {
        return new MockMultipartFile("file", fileName, "text/csv", content.getBytes());
    }
}

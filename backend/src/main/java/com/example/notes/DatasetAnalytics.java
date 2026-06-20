package com.example.notes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "dataset_analytics")
public class DatasetAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dataset_id", nullable = false, unique = true)
    private Dataset dataset;

    @Column(nullable = false, updatable = false)
    private Instant computedAt = Instant.now();

    @Column(nullable = false, columnDefinition = "text")
    private String payloadJson;

    public DatasetAnalytics() {}

    public DatasetAnalytics(Dataset dataset, String payloadJson) {
        this.dataset = dataset;
        this.payloadJson = payloadJson;
        this.computedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Dataset getDataset() {
        return dataset;
    }

    public Instant getComputedAt() {
        return computedAt;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
        this.computedAt = Instant.now();
    }
}

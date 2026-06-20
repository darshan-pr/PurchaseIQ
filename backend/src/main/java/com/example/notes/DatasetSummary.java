package com.example.notes;

import java.time.Instant;

public record DatasetSummary(
        Long datasetId,
        String datasetName,
        String fileName,
        Integer version,
        Long recordCount,
        Instant uploadedAt,
        DatasetStatus status,
        boolean active,
        long issueCount) {
    static DatasetSummary from(Dataset dataset, long issueCount) {
        return new DatasetSummary(
                dataset.getId(),
                dataset.getDatasetName(),
                dataset.getFileName(),
                dataset.getVersionNumber(),
                dataset.getRecordCount(),
                dataset.getUploadedAt(),
                dataset.getStatus(),
                dataset.isActive(),
                issueCount);
    }
}

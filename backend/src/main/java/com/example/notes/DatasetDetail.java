package com.example.notes;

import java.time.Instant;
import java.util.List;

public record DatasetDetail(
        Long datasetId,
        String datasetName,
        String fileName,
        Integer version,
        Long recordCount,
        Instant uploadedAt,
        DatasetStatus status,
        boolean active,
        long issueCount,
        List<ImportIssueSummary> issues) {
    static DatasetDetail from(Dataset dataset, long issueCount, List<DatasetImportIssue> issues) {
        return new DatasetDetail(
                dataset.getId(),
                dataset.getDatasetName(),
                dataset.getFileName(),
                dataset.getVersionNumber(),
                dataset.getRecordCount(),
                dataset.getUploadedAt(),
                dataset.getStatus(),
                dataset.isActive(),
                issueCount,
                issues.stream().map(ImportIssueSummary::from).toList());
    }
}

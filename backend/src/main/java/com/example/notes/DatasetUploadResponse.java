package com.example.notes;

public record DatasetUploadResponse(
        Long datasetId, Integer version, DatasetStatus status, Long recordCount, long issueCount) {}

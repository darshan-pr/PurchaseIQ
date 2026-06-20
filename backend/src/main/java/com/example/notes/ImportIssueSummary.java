package com.example.notes;

public record ImportIssueSummary(Integer rowNumber, String reason) {
    static ImportIssueSummary from(DatasetImportIssue issue) {
        return new ImportIssueSummary(issue.getRowNumber(), issue.getReason());
    }
}

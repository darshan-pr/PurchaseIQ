package com.example.notes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "dataset_import_issues")
public class DatasetImportIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;

    @Column(nullable = false)
    private Integer rowNumber;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false, length = 4000)
    private String rawRow;

    public DatasetImportIssue() {}

    public DatasetImportIssue(Dataset dataset, Integer rowNumber, String reason, String rawRow) {
        this.dataset = dataset;
        this.rowNumber = rowNumber;
        this.reason = reason;
        this.rawRow = rawRow;
    }

    public Integer getRowNumber() {
        return rowNumber;
    }

    public String getReason() {
        return reason;
    }
}

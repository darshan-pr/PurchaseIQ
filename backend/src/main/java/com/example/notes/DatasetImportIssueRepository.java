package com.example.notes;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatasetImportIssueRepository extends JpaRepository<DatasetImportIssue, Long> {
    List<DatasetImportIssue> findTop10ByDatasetIdOrderByRowNumberAsc(Long datasetId);

    long countByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

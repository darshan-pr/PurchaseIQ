package com.example.notes;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatasetAnalyticsRepository extends JpaRepository<DatasetAnalytics, Long> {
    Optional<DatasetAnalytics> findByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

package com.example.notes;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

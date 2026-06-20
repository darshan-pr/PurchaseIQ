package com.example.notes;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findAllByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

package com.example.notes;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findAllByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

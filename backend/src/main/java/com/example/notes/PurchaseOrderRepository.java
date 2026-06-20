package com.example.notes;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByDatasetId(Long datasetId);

    void deleteByDatasetId(Long datasetId);
}

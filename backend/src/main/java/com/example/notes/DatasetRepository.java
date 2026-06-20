package com.example.notes;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    List<Dataset> findAllByOrderByVersionNumberDesc();

    Optional<Dataset> findByActiveTrue();

    List<Dataset> findAllByActiveTrue();

    Optional<Dataset> findTopByOrderByVersionNumberDesc();
}

package com.textile.salesorder.repository;

import com.textile.salesorder.domain.Quality;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QualityRepository extends JpaRepository<Quality, Long> {
    List<Quality> findAllByOrderBySortNumberAsc();
}

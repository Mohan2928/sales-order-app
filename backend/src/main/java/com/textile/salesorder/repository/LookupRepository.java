package com.textile.salesorder.repository;

import com.textile.salesorder.domain.Lookup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LookupRepository extends JpaRepository<Lookup, Long> {
    List<Lookup> findByCategoryOrderByNameAsc(String category);
    boolean existsByCategoryAndName(String category, String name);
}

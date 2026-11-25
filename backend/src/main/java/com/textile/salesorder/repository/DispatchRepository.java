package com.textile.salesorder.repository;

import com.textile.salesorder.domain.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
    List<Dispatch> findBySalesOrderLineSalesOrderIdOrderByDispatchDateDescIdDesc(Long orderId);
}

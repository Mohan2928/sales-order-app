package com.textile.salesorder.repository;

import com.textile.salesorder.domain.OrderStatus;
import com.textile.salesorder.domain.SalesOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    @Query("""
            select distinct o from SalesOrder o
            left join o.lines l
            where (:orderNo = '' or lower(o.orderNo) like lower(concat('%', :orderNo, '%')))
              and (:buyerId is null or o.buyer.id = :buyerId)
              and (:qualityId is null or l.quality.id = :qualityId)
              and (:status is null or o.status = :status)
              and (:fromDate is null or o.orderDate >= :fromDate)
              and (:toDate is null or o.orderDate <= :toDate)
            order by o.orderDate desc, o.id desc
            """)
    Page<SalesOrder> search(@Param("orderNo") String orderNo,
                            @Param("buyerId") Long buyerId,
                            @Param("qualityId") Long qualityId,
                            @Param("status") OrderStatus status,
                            @Param("fromDate") LocalDate fromDate,
                            @Param("toDate") LocalDate toDate,
                            Pageable pageable);

    @Query("""
            select distinct o from SalesOrder o
            left join o.lines l
            where (:orderNo = '' or lower(o.orderNo) like lower(concat('%', :orderNo, '%')))
              and (:buyerId is null or o.buyer.id = :buyerId)
              and (:qualityId is null or l.quality.id = :qualityId)
              and (:status is null or o.status = :status)
              and (:fromDate is null or o.orderDate >= :fromDate)
              and (:toDate is null or o.orderDate <= :toDate)
            order by o.orderDate desc, o.id desc
            """)
    List<SalesOrder> searchAll(@Param("orderNo") String orderNo,
                               @Param("buyerId") Long buyerId,
                               @Param("qualityId") Long qualityId,
                               @Param("status") OrderStatus status,
                               @Param("fromDate") LocalDate fromDate,
                               @Param("toDate") LocalDate toDate);
}

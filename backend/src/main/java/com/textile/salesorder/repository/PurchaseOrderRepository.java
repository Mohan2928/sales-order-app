package com.textile.salesorder.repository;

import com.textile.salesorder.domain.PurchaseOrder;
import com.textile.salesorder.domain.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("""
            select p from PurchaseOrder p left join p.vendor v
            where (:fromDate is null or p.poDate >= :fromDate)
              and (:toDate is null or p.poDate <= :toDate)
              and (:quality is null or :quality = '' or p.quality = :quality)
              and (:poNo is null or :poNo = '' or p.poNumber = :poNo)
              and (:vendor is null or :vendor = '' or v.name = :vendor)
              and (:agent is null or :agent = '' or p.agent = :agent)
              and (:soNo is null or :soNo = '' or p.soNumber = :soNo)
              and (:status is null or p.status = :status)
            order by p.poDate desc, p.id desc
            """)
    Page<PurchaseOrder> search(@Param("fromDate") LocalDate fromDate,
                               @Param("toDate") LocalDate toDate,
                               @Param("quality") String quality,
                               @Param("poNo") String poNo,
                               @Param("vendor") String vendor,
                               @Param("agent") String agent,
                               @Param("soNo") String soNo,
                               @Param("status") PurchaseOrderStatus status,
                               Pageable pageable);

    @Query("""
            select p from PurchaseOrder p left join p.vendor v
            where (:fromDate is null or p.poDate >= :fromDate)
              and (:toDate is null or p.poDate <= :toDate)
              and (:quality is null or :quality = '' or p.quality = :quality)
              and (:poNo is null or :poNo = '' or p.poNumber = :poNo)
              and (:vendor is null or :vendor = '' or v.name = :vendor)
              and (:agent is null or :agent = '' or p.agent = :agent)
              and (:soNo is null or :soNo = '' or p.soNumber = :soNo)
              and (:status is null or p.status = :status)
            order by p.poDate desc, p.id desc
            """)
    List<PurchaseOrder> searchAll(@Param("fromDate") LocalDate fromDate,
                                  @Param("toDate") LocalDate toDate,
                                  @Param("quality") String quality,
                                  @Param("poNo") String poNo,
                                  @Param("vendor") String vendor,
                                  @Param("agent") String agent,
                                  @Param("soNo") String soNo,
                                  @Param("status") PurchaseOrderStatus status);

    @Query("select distinct v.name from PurchaseOrder p join p.vendor v where v.name is not null order by v.name")
    List<String> findDistinctVendorNames();

    @Query("select distinct p.agent from PurchaseOrder p where p.agent is not null and p.agent <> '' order by p.agent")
    List<String> findDistinctAgents();

    @Query("select distinct p.quality from PurchaseOrder p where p.quality is not null and p.quality <> '' order by p.quality")
    List<String> findDistinctQualities();

    @Query("select distinct p.poNumber from PurchaseOrder p where p.poNumber is not null and p.poNumber <> '' order by p.poNumber")
    List<String> findDistinctPoNumbers();

    @Query("select distinct p.soNumber from PurchaseOrder p where p.soNumber is not null and p.soNumber <> '' order by p.soNumber")
    List<String> findDistinctSoNumbers();

    @Query("select max(p.poNumber) from PurchaseOrder p where p.poNumber like concat(:prefix, '%')")
    String findMaxPoNumberByPrefix(@Param("prefix") String prefix);
}

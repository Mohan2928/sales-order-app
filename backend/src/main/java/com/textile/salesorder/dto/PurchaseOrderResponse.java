package com.textile.salesorder.dto;

import com.textile.salesorder.domain.PurchaseOrder;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseOrderResponse(
        Long id,
        LocalDate poDate,
        String poNumber,
        String soNumber,
        String vendorName,
        String agent,
        String quality,
        BigDecimal totalQuantity,
        String status,
        String approverStatus) {

    public static PurchaseOrderResponse from(PurchaseOrder p) {
        return from(p, p.getTotalQuantity());
    }

    public static PurchaseOrderResponse from(PurchaseOrder p, BigDecimal effectiveTotalQty) {
        return new PurchaseOrderResponse(
                p.getId(),
                p.getPoDate(),
                p.getPoNumber(),
                p.getSoNumber(),
                p.getVendor() != null ? p.getVendor().getName() : null,
                p.getAgent(),
                p.getQuality(),
                effectiveTotalQty,
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getApproverStatus());
    }
}

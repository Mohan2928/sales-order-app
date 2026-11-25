package com.textile.salesorder.dto;

import com.textile.salesorder.domain.PurchaseOrder;
import com.textile.salesorder.domain.PurchaseOrderItem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record PurchaseOrderReportResponse(
        Long id,
        String poNumber,
        LocalDate poDate,
        LocalDate deliveryDate,
        String soNumber,
        String vendorName,
        String quality,
        BigDecimal rate,
        BigDecimal poQty,
        BigDecimal receivedQty,
        BigDecimal balanceQty,
        BigDecimal totalAmount,
        String status
) {
    public static PurchaseOrderReportResponse from(PurchaseOrder p, BigDecimal effectiveTotalQty) {
        List<PurchaseOrderItem> items = p.getItems() == null ? List.of() : p.getItems();

        // Get delivery date from first item with delivery date
        LocalDate deliveryDate = items.stream()
                .map(PurchaseOrderItem::getDeliveryDate)
                .filter(d -> d != null)
                .findFirst()
                .orElse(null);

        // Get rate (unit price) from first item
        BigDecimal rate = items.stream()
                .map(PurchaseOrderItem::getUnitPrice)
                .filter(r -> r != null)
                .findFirst()
                .orElse(BigDecimal.ZERO);

        // PO Qty = sum of all item quantities
        BigDecimal poQty = items.stream()
                .map(PurchaseOrderItem::getQuantity)
                .filter(q -> q != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Received qty - for now 0 (no receipt tracking yet)
        BigDecimal receivedQty = BigDecimal.ZERO;

        // Balance = PO Qty - Received
        BigDecimal balanceQty = poQty.subtract(receivedQty);

        // Total amount from all items
        BigDecimal totalAmount = items.stream()
                .map(PurchaseOrderItem::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PurchaseOrderReportResponse(
                p.getId(),
                p.getPoNumber(),
                p.getPoDate(),
                deliveryDate,
                p.getSoNumber(),
                p.getVendor() != null ? p.getVendor().getName() : null,
                p.getQuality(),
                rate,
                poQty,
                receivedQty,
                balanceQty,
                totalAmount,
                p.getStatus() != null ? p.getStatus().name() : null
        );
    }
}
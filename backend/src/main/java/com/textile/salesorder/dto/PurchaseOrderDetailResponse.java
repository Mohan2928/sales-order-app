package com.textile.salesorder.dto;

import com.textile.salesorder.domain.PurchaseOrder;
import com.textile.salesorder.domain.PurchaseOrderItem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record PurchaseOrderDetailResponse(
        Long id,
        String poNumber,
        LocalDate poDate,
        String soNumber,
        Long vendorId,
        String vendorName,
        String agent,
        String quality,
        BigDecimal totalQuantity,
        String status,
        String approverStatus,
        String vendorGroup,
        String fabricType,
        String consignee,
        String salesAddress,
        String paymentTerms,
        String termsAndCondition,
        String customerSo,
        String company,
        String gstType,
        List<Item> items
) {
    public record Item(
            Long id,
            String quality,
            String displayQuality,
            BigDecimal quantity,
            String uom,
            BigDecimal unitPrice,
            BigDecimal basicAmount,
            BigDecimal gstPercent,
            BigDecimal gstAmount,
            BigDecimal totalAmount,
            String deliveryTerms,
            BigDecimal provisionalFreight,
            BigDecimal millGstPrice,
            BigDecimal finalPrice,
            LocalDate deliveryDate,
            String remark,
            List<String> certifications
    ) {}

    public static PurchaseOrderDetailResponse from(PurchaseOrder p, BigDecimal effectiveTotalQty) {
        List<Item> itemDtos = (p.getItems() == null ? List.<PurchaseOrderItem>of() : p.getItems()).stream().map(i -> new Item(
                i.getId(),
                i.getQuality(),
                i.getDisplayQuality(),
                i.getQuantity(),
                i.getUom(),
                i.getUnitPrice(),
                i.getBasicAmount(),
                i.getGstPercent(),
                i.getGstAmount(),
                i.getTotalAmount(),
                i.getDeliveryTerms(),
                i.getProvisionalFreight(),
                i.getMillGstPrice(),
                i.getFinalPrice(),
                i.getDeliveryDate(),
                i.getRemark(),
                i.getCertifications() == null ? List.of() : new ArrayList<>(i.getCertifications())
        )).toList();

        return new PurchaseOrderDetailResponse(
                p.getId(),
                p.getPoNumber(),
                p.getPoDate(),
                p.getSoNumber(),
                p.getVendor() != null ? p.getVendor().getId() : null,
                p.getVendor() != null ? p.getVendor().getName() : null,
                p.getAgent(),
                p.getQuality(),
                effectiveTotalQty,
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getApproverStatus(),
                p.getVendorGroup(),
                p.getFabricType(),
                p.getConsignee(),
                p.getSalesAddress(),
                p.getPaymentTerms(),
                p.getTermsAndCondition(),
                p.getCustomerSo(),
                p.getCompany(),
                p.getGstType(),
                itemDtos
        );
    }
}

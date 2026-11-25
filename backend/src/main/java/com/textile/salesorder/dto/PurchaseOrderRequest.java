package com.textile.salesorder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull LocalDate poDate,
        @NotBlank String vendorGroup,
        @NotNull Long vendorId,
        String agent,
        String soNumber,
        @NotBlank String fabricType,
        String consignee,
        String salesAddress,
        @NotBlank String paymentTerms,
        String termsAndCondition,
        String customerSo,
        @NotBlank String company,
        String gstType,
        @NotEmpty @Valid List<Item> items
) {
    public record Item(
            @NotBlank String quality,
            String displayQuality,
            @NotNull @Positive BigDecimal quantity,
            @NotBlank String uom,
            @NotNull @Positive BigDecimal unitPrice,
            @NotNull BigDecimal gstPercent,
            String deliveryTerms,
            BigDecimal provisionalFreight,
            BigDecimal millGstPrice,
            BigDecimal finalPrice,
            LocalDate deliveryDate,
            String remark,
            List<String> certifications
    ) {}
}

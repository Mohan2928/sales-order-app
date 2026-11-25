package com.textile.salesorder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Payload for creating a domestic sales order. Mandatory fields mirror the red * fields on the form. */
public record SalesOrderRequest(
        @NotBlank String invoiceType,
        @NotBlank String contractType,
        @NotBlank String contractOrderRoute,
        @NotNull LocalDate orderDate,
        @NotNull Long buyerId,
        @NotBlank String buyerAddress,
        @NotBlank String agent,
        @NotBlank String deliveryAddress,
        @NotNull LocalDate confirmationDate,
        @NotBlank String shipmentMode,
        @NotBlank String deliveryTerms,
        @NotBlank String paymentTerms,
        @NotBlank String gstType,
        @NotBlank String salesCoordinator,
        @NotBlank String bank,
        @NotBlank String soType,
        @NotBlank String sourcingBy,
        String buyerPo,
        @NotBlank String termsAndCondition,
        String remarks,
        @NotEmpty @Valid List<Line> lines) {

    public record Line(
            @NotBlank String fabricType,
            @NotNull Long qualityId,
            @NotBlank String buyerProduct,
            @NotNull @Positive Integer fabricWidth,
            @NotBlank String inspectionType,
            @NotNull @Positive BigDecimal quantity,
            @NotBlank String uom,
            @NotNull @PositiveOrZero BigDecimal pricePerUnit,
            BigDecimal gstPercent,
            @NotBlank String weaveType,
            @NotBlank String packingType,
            @NotNull LocalDate deliveryDate,
            @NotNull @PositiveOrZero BigDecimal variationPercent,
            BigDecimal weavingQty,
            @NotNull @PositiveOrZero BigDecimal purchaseQty,
            @NotBlank String costingNumber) {
    }
}

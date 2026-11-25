package com.textile.salesorder.dto;

import com.textile.salesorder.domain.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalesOrderResponse(
        Long id, String orderNo, String status,
        String invoiceType, String contractType, String contractOrderRoute,
        LocalDate orderDate, Long buyerId, String buyerName, String buyerAddress,
        String agent, String deliveryAddress, LocalDate confirmationDate,
        String shipmentMode, String deliveryTerms, String paymentTerms, String gstType,
        String salesCoordinator, String bank, String soType, String sourcingBy,
        String buyerPo, String termsAndCondition, String remarks,
        BigDecimal orderQuantity, BigDecimal dispatchQuantity, BigDecimal balanceQuantity,
        BigDecimal totalAmount, String uom,
        List<Line> lines) {

    public record Line(
            Long id, String fabricType, Long qualityId, String qualityDescription, String sortNumber,
            String buyerProduct, Integer fabricWidth, String inspectionType,
            BigDecimal quantity, String uom, BigDecimal pricePerUnit, BigDecimal basicAmount,
            BigDecimal gstPercent, BigDecimal totalAmount, String weaveType, String packingType,
            LocalDate deliveryDate, BigDecimal variationPercent, BigDecimal weavingQty,
            BigDecimal purchaseQty, String costingNumber, BigDecimal dispatchQty) {

        public static Line from(SalesOrderLine l) {
            return new Line(l.getId(), l.getFabricType(), l.getQuality().getId(),
                    l.getQuality().getDescription(), l.getQuality().getSortNumber(),
                    l.getBuyerProduct(), l.getFabricWidth(), l.getInspectionType(),
                    l.getQuantity(), l.getUom(), l.getPricePerUnit(), l.getBasicAmount(),
                    l.getGstPercent(), l.getTotalAmount(), l.getWeaveType(), l.getPackingType(),
                    l.getDeliveryDate(), l.getVariationPercent(), l.getWeavingQty(),
                    l.getPurchaseQty(), l.getCostingNumber(), l.getDispatchQty());
        }
    }

    public static SalesOrderResponse from(SalesOrder o) {
        List<Line> lines = o.getLines().stream().map(Line::from).toList();
        BigDecimal qty = lines.stream().map(Line::quantity).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal disp = lines.stream().map(Line::dispatchQty).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = lines.stream().map(Line::totalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String uom = lines.isEmpty() ? "" : lines.get(0).uom();
        return new SalesOrderResponse(
                o.getId(), o.getOrderNo(), o.getStatus().name(),
                o.getInvoiceType(), o.getContractType(), o.getContractOrderRoute(),
                o.getOrderDate(), o.getBuyer().getId(), o.getBuyer().getName(), o.getBuyerAddress(),
                o.getAgent(), o.getDeliveryAddress(), o.getConfirmationDate(),
                o.getShipmentMode(), o.getDeliveryTerms(), o.getPaymentTerms(), o.getGstType(),
                o.getSalesCoordinator(), o.getBank(), o.getSoType(), o.getSourcingBy(),
                o.getBuyerPo(), o.getTermsAndCondition(), o.getRemarks(),
                qty, disp, qty.subtract(disp), total, uom, lines);
    }
}

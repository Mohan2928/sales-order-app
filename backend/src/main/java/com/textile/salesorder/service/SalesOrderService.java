package com.textile.salesorder.service;

import com.textile.salesorder.domain.*;
import com.textile.salesorder.dto.PagedResponse;
import com.textile.salesorder.dto.SalesOrderRequest;
import com.textile.salesorder.dto.SalesOrderResponse;
import com.textile.salesorder.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SalesOrderService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal DEFAULT_GST = BigDecimal.valueOf(5);
    private static final int MAX_EXPORT_ROWS = 5000;

    /** Allowed status changes (what the action icons on the list screen do). */
    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = new EnumMap<>(OrderStatus.class);
    static {
        TRANSITIONS.put(OrderStatus.PENDING, Set.of(OrderStatus.MOVED_TO_PRODUCTION, OrderStatus.REJECTED,
                OrderStatus.ON_HOLD, OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.ON_HOLD, Set.of(OrderStatus.PENDING, OrderStatus.MOVED_TO_PRODUCTION,
                OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.MOVED_TO_PRODUCTION, Set.of(OrderStatus.COMPLETED, OrderStatus.ON_HOLD,
                OrderStatus.CANCELLED));
        TRANSITIONS.put(OrderStatus.COMPLETED, Set.of());
        TRANSITIONS.put(OrderStatus.REJECTED, Set.of());
        TRANSITIONS.put(OrderStatus.CANCELLED, Set.of());
    }

    private final SalesOrderRepository orders;
    private final BuyerRepository buyers;
    private final QualityRepository qualities;

    @Value("${app.order-no-prefix}")
    private String orderNoPrefix;

    public SalesOrderService(SalesOrderRepository orders, BuyerRepository buyers, QualityRepository qualities) {
        this.orders = orders;
        this.buyers = buyers;
        this.qualities = qualities;
    }

@Transactional(readOnly = true)
    public PagedResponse<SalesOrderResponse> search(String orderNo, Long buyerId, Long qualityId, OrderStatus status,
                                             LocalDate fromDate, LocalDate toDate, int page, int size) {
        int p = Math.max(page, 0);
        int s = (size > 0 && size <= 100) ? size : 10;
        return PagedResponse.of(orders.search(orderNo == null ? "" : orderNo.trim(), buyerId, qualityId, status, fromDate, toDate, PageRequest.of(p, s))
                .map(SalesOrderResponse::from));
    }

    @Transactional(readOnly = true)
    public List<SalesOrderResponse> searchAll(String orderNo, Long buyerId, Long qualityId, OrderStatus status,
                                              LocalDate fromDate, LocalDate toDate) {
        return orders.searchAll(orderNo == null ? "" : orderNo.trim(), buyerId, qualityId, status, fromDate, toDate)
                .stream().map(SalesOrderResponse::from).limit(MAX_EXPORT_ROWS).toList();
    }

    // Report endpoints (alias for search with same filters)
    @Transactional(readOnly = true)
    public PagedResponse<SalesOrderResponse> searchReport(String orderNo, Long buyerId, Long qualityId, OrderStatus status,
                                                 LocalDate fromDate, LocalDate toDate, int page, int size) {
        return search(orderNo, buyerId, qualityId, status, fromDate, toDate, page, size);
    }

    @Transactional(readOnly = true)
    public List<SalesOrderResponse> searchReportAll(String orderNo, Long buyerId, Long qualityId, OrderStatus status,
                                                    LocalDate fromDate, LocalDate toDate) {
        return searchAll(orderNo, buyerId, qualityId, status, fromDate, toDate);
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse get(Long id) {
        return SalesOrderResponse.from(find(id));
    }

    @Transactional
    public SalesOrderResponse create(SalesOrderRequest req) {
        Buyer buyer = buyers.findById(req.buyerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown buyer"));

        SalesOrder o = new SalesOrder();
        o.setInvoiceType(req.invoiceType());
        o.setContractType(req.contractType());
        o.setContractOrderRoute(req.contractOrderRoute());
        o.setOrderDate(req.orderDate());
        o.setBuyer(buyer);
        o.setBuyerAddress(req.buyerAddress());
        o.setAgent(req.agent());
        o.setDeliveryAddress(req.deliveryAddress());
        o.setConfirmationDate(req.confirmationDate());
        o.setShipmentMode(req.shipmentMode());
        o.setDeliveryTerms(req.deliveryTerms());
        o.setPaymentTerms(req.paymentTerms());
        o.setGstType(req.gstType());
        o.setSalesCoordinator(req.salesCoordinator());
        o.setBank(req.bank());
        o.setSoType(req.soType());
        o.setSourcingBy(req.sourcingBy());
        o.setBuyerPo(req.buyerPo());
        o.setTermsAndCondition(req.termsAndCondition());
        o.setRemarks(req.remarks());
        o.setStatus(OrderStatus.PENDING);

        for (SalesOrderRequest.Line l : req.lines()) {
            o.addLine(toLine(l));
        }

        SalesOrder saved = orders.saveAndFlush(o);
        saved.setOrderNo(orderNoPrefix + String.format("%04d", saved.getId()));
        return SalesOrderResponse.from(saved);
    }

    @Transactional
    public SalesOrderResponse update(Long id, SalesOrderRequest req) {
        SalesOrder o = find(id);
        Buyer buyer = buyers.findById(req.buyerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown buyer"));

        o.setInvoiceType(req.invoiceType());
        o.setContractType(req.contractType());
        o.setContractOrderRoute(req.contractOrderRoute());
        o.setOrderDate(req.orderDate());
        o.setBuyer(buyer);
        o.setBuyerAddress(req.buyerAddress());
        o.setAgent(req.agent());
        o.setDeliveryAddress(req.deliveryAddress());
        o.setConfirmationDate(req.confirmationDate());
        o.setShipmentMode(req.shipmentMode());
        o.setDeliveryTerms(req.deliveryTerms());
        o.setPaymentTerms(req.paymentTerms());
        o.setGstType(req.gstType());
        o.setSalesCoordinator(req.salesCoordinator());
        o.setBank(req.bank());
        o.setSoType(req.soType());
        o.setSourcingBy(req.sourcingBy());
        o.setBuyerPo(req.buyerPo());
        o.setTermsAndCondition(req.termsAndCondition());
        o.setRemarks(req.remarks());

        o.getLines().clear();
        for (SalesOrderRequest.Line l : req.lines()) {
            o.addLine(toLine(l));
        }
        return SalesOrderResponse.from(o);
    }

    @Transactional
    public SalesOrderResponse changeStatus(Long id, OrderStatus target) {
        SalesOrder o = find(id);
        if (!TRANSITIONS.getOrDefault(o.getStatus(), Set.of()).contains(target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot change order from " + o.getStatus() + " to " + target);
        }
        o.setStatus(target);
        return SalesOrderResponse.from(o);
    }

    private SalesOrderLine toLine(SalesOrderRequest.Line r) {
        Quality q = qualities.findById(r.qualityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown quality"));

        BigDecimal gst = r.gstPercent() == null ? DEFAULT_GST : r.gstPercent();
        BigDecimal basic = r.quantity().multiply(r.pricePerUnit()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = basic.add(basic.multiply(gst).divide(HUNDRED, 2, RoundingMode.HALF_UP));

        SalesOrderLine l = new SalesOrderLine();
        l.setFabricType(r.fabricType());
        l.setQuality(q);
        l.setBuyerProduct(r.buyerProduct());
        l.setFabricWidth(r.fabricWidth());
        l.setInspectionType(r.inspectionType());
        l.setQuantity(r.quantity());
        l.setUom(r.uom());
        l.setPricePerUnit(r.pricePerUnit());
        l.setGstPercent(gst);
        l.setBasicAmount(basic);
        l.setTotalAmount(total);
        l.setWeaveType(r.weaveType());
        l.setPackingType(r.packingType());
        l.setDeliveryDate(r.deliveryDate());
        l.setVariationPercent(r.variationPercent());
        l.setWeavingQty(r.weavingQty());
        l.setPurchaseQty(r.purchaseQty());
        l.setCostingNumber(r.costingNumber());
        return l;
    }

    private SalesOrder find(Long id) {
        return orders.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }
}

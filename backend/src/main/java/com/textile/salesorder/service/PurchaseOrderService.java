package com.textile.salesorder.service;

import com.textile.salesorder.domain.*;
import com.textile.salesorder.dto.PagedResponse;
import com.textile.salesorder.dto.PurchaseOrderDetailResponse;
import com.textile.salesorder.dto.PurchaseOrderReportResponse;
import com.textile.salesorder.dto.PurchaseOrderRequest;
import com.textile.salesorder.dto.PurchaseOrderResponse;
import com.textile.salesorder.repository.PurchaseOrderRepository;
import com.textile.salesorder.repository.VendorRepository;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PurchaseOrderService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int MAX_EXPORT_ROWS = 5000;

    private final PurchaseOrderRepository purchaseOrders;
    private final VendorRepository vendors;

    @Value("${app.po-no-prefix:TTPL/26/}")
    private String poNoPrefix;

    @Value("${app.company-name:TOTALA TEXTILES PRIVATE LIMITED}")
    private String defaultCompanyName;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrders, VendorRepository vendors) {
        this.purchaseOrders = purchaseOrders;
        this.vendors = vendors;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> search(LocalDate fromDate, LocalDate toDate, String quality, String poNo,
                                      String vendor, String agent, String soNo, PurchaseOrderStatus status,
                                      int page, int size) {
        int p = Math.max(page, 0);
        int s = (size > 0 && size <= 100) ? size : 10;
        Page<PurchaseOrder> result = purchaseOrders.search(fromDate, toDate, quality, poNo, vendor, agent, soNo, status, PageRequest.of(p, s));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("content", result.getContent().stream().map(po -> PurchaseOrderResponse.from(po, effectiveTotalQuantity(po))).toList());
        out.put("page", result.getNumber());
        out.put("size", result.getSize());
        out.put("totalElements", result.getTotalElements());
        out.put("totalPages", result.getTotalPages());
        return out;
    }

@Transactional(readOnly = true)
    public PagedResponse<PurchaseOrderReportResponse> searchReport(LocalDate fromDate, LocalDate toDate, String quality, String poNo,
                                                           String vendor, String agent, String soNo, PurchaseOrderStatus status,
                                                           int page, int size) {
        int p = Math.max(page, 0);
        int s = (size > 0 && size <= 100) ? size : 10;
        return PagedResponse.of(purchaseOrders.search(fromDate, toDate, quality, poNo, vendor, agent, soNo, status, PageRequest.of(p, s))
                .map(po -> PurchaseOrderReportResponse.from(po, effectiveTotalQuantity(po))));
    }

@Transactional(readOnly = true)
    public List<PurchaseOrderReportResponse> searchReportAll(LocalDate fromDate, LocalDate toDate, String quality, String poNo,
                                                              String vendor, String agent, String soNo, PurchaseOrderStatus status) {
        return purchaseOrders.searchAll(fromDate, toDate, quality, poNo, vendor, agent, soNo, status)
                .stream().map(po -> PurchaseOrderReportResponse.from(po, effectiveTotalQuantity(po))).limit(MAX_EXPORT_ROWS).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, List<String>> filters() {
        Map<String, List<String>> m = new LinkedHashMap<>();
        m.put("vendors", purchaseOrders.findDistinctVendorNames());
        m.put("agents", purchaseOrders.findDistinctAgents());
        m.put("qualities", purchaseOrders.findDistinctQualities());
        m.put("poNumbers", purchaseOrders.findDistinctPoNumbers());
        m.put("soNumbers", purchaseOrders.findDistinctSoNumbers());
        return m;
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDetailResponse get(Long id) {
        PurchaseOrder po = find(id);
        return PurchaseOrderDetailResponse.from(po, effectiveTotalQuantity(po));
    }

    @Transactional
    public PurchaseOrderDetailResponse create(PurchaseOrderRequest req) {
        Vendor vendor = vendors.findById(req.vendorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor is required"));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(nextPoNumber());
        po.setStatus(PurchaseOrderStatus.PENDING);
        applyHeader(po, req, vendor);
        applyItems(po, req.items());

        PurchaseOrder saved = purchaseOrders.saveAndFlush(po);
        return PurchaseOrderDetailResponse.from(saved, effectiveTotalQuantity(saved));
    }

    @Transactional
    public PurchaseOrderDetailResponse update(Long id, PurchaseOrderRequest req) {
        PurchaseOrder po = find(id);
        Vendor vendor = vendors.findById(req.vendorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor is required"));

        applyHeader(po, req, vendor);
        po.getItems().clear();
        applyItems(po, req.items());
        // poNumber and status unchanged
        return PurchaseOrderDetailResponse.from(po, effectiveTotalQuantity(po));
    }

    @Transactional
    public PurchaseOrderDetailResponse changeStatus(Long id, PurchaseOrderStatus status) {
        PurchaseOrder po = find(id);
        po.setStatus(status);
        return PurchaseOrderDetailResponse.from(po, effectiveTotalQuantity(po));
    }

    private void applyHeader(PurchaseOrder po, PurchaseOrderRequest req, Vendor vendor) {
        po.setPoDate(req.poDate());
        po.setVendorGroup(req.vendorGroup());
        po.setVendor(vendor);
        po.setAgent(blankToNull(req.agent()));
        po.setSoNumber(blankToNull(req.soNumber()));
        po.setFabricType(req.fabricType());
        po.setConsignee(blankToNull(req.consignee()));
        po.setSalesAddress(blankToNull(req.salesAddress()));
        po.setPaymentTerms(req.paymentTerms());
        po.setTermsAndCondition(blankToNull(req.termsAndCondition()));
        po.setCustomerSo(blankToNull(req.customerSo()));
        po.setCompany(req.company() == null || req.company().isBlank() ? defaultCompanyName : req.company());
        String gst = req.gstType();
        po.setGstType((gst == null || gst.isBlank()) ? "IGST" : gst);
    }

    private void applyItems(PurchaseOrder po, List<PurchaseOrderRequest.Item> itemsReq) {
        BigDecimal totalQty = BigDecimal.ZERO;
        String firstQuality = null;
        for (PurchaseOrderRequest.Item r : itemsReq) {
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setQuality(r.quality());
            item.setDisplayQuality(blankToNull(r.displayQuality()));
            item.setQuantity(r.quantity());
            item.setUom(r.uom());
            item.setUnitPrice(r.unitPrice());

            BigDecimal basic = r.quantity().multiply(r.unitPrice()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal gstAmount = basic.multiply(r.gstPercent()).divide(HUNDRED, 2, RoundingMode.HALF_UP);
            BigDecimal total = basic.add(gstAmount).setScale(2, RoundingMode.HALF_UP);
            item.setBasicAmount(basic);
            item.setGstPercent(r.gstPercent());
            item.setGstAmount(gstAmount);
            item.setTotalAmount(total);

            item.setDeliveryTerms(blankToNull(r.deliveryTerms()));
            item.setProvisionalFreight(r.provisionalFreight());
            item.setMillGstPrice(r.millGstPrice());
            item.setFinalPrice(r.finalPrice());
            item.setDeliveryDate(r.deliveryDate());
            item.setRemark(blankToNull(r.remark()));

            List<String> certs = new ArrayList<>();
            if (r.certifications() != null) {
                for (String c : r.certifications()) {
                    if (c != null && !c.isBlank() && !certs.contains(c)) certs.add(c);
                }
            }
            item.setCertifications(certs);

            po.addItem(item);
            if (r.quantity() != null) totalQty = totalQty.add(r.quantity());
            if (firstQuality == null) firstQuality = r.quality();
        }
        po.setTotalQuantity(totalQty);
        if (firstQuality != null) po.setQuality(firstQuality);
    }

    private BigDecimal effectiveTotalQuantity(PurchaseOrder po) {
        if (po.getItems() != null && !po.getItems().isEmpty()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (PurchaseOrderItem it : po.getItems()) {
                if (it.getQuantity() != null) sum = sum.add(it.getQuantity());
            }
            return sum;
        }
        return po.getTotalQuantity();
    }

    private String nextPoNumber() {
        String max = purchaseOrders.findMaxPoNumberByPrefix(poNoPrefix);
        int next = 1;
        if (max != null && max.startsWith(poNoPrefix)) {
            String suffix = max.substring(poNoPrefix.length());
            try { next = Integer.parseInt(suffix) + 1; } catch (NumberFormatException ignored) { next = 1; }
        }
        return poNoPrefix + String.format("%05d", next);
    }

    private PurchaseOrder find(Long id) {
        return purchaseOrders.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase order not found"));
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}

package com.textile.salesorder.web;

import com.textile.salesorder.domain.PurchaseOrderStatus;
import com.textile.salesorder.dto.PagedResponse;
import com.textile.salesorder.dto.PurchaseOrderDetailResponse;
import com.textile.salesorder.dto.PurchaseOrderReportResponse;
import com.textile.salesorder.dto.PurchaseOrderRequest;
import com.textile.salesorder.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                    @RequestParam(required = false) String quality,
                                    @RequestParam(required = false) String poNo,
                                    @RequestParam(required = false) String vendor,
                                    @RequestParam(required = false) String agent,
                                    @RequestParam(required = false) String soNo,
                                    @RequestParam(required = false) PurchaseOrderStatus status,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return service.search(fromDate, toDate, quality, poNo, vendor, agent, soNo, status, page, size);
    }

@GetMapping("/report")
    public PagedResponse<PurchaseOrderReportResponse> report(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                     @RequestParam(required = false) String quality,
                                                     @RequestParam(required = false) String poNo,
                                                     @RequestParam(required = false) String vendor,
                                                     @RequestParam(required = false) String agent,
                                                     @RequestParam(required = false) String soNo,
                                                     @RequestParam(required = false) PurchaseOrderStatus status,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        return service.searchReport(fromDate, toDate, quality, poNo, vendor, agent, soNo, status, page, size);
    }

    @GetMapping("/report/all")
    public List<PurchaseOrderReportResponse> reportAll(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                       @RequestParam(required = false) String quality,
                                                       @RequestParam(required = false) String poNo,
                                                       @RequestParam(required = false) String vendor,
                                                       @RequestParam(required = false) String agent,
                                                       @RequestParam(required = false) String soNo,
                                                       @RequestParam(required = false) PurchaseOrderStatus status) {
        return service.searchReportAll(fromDate, toDate, quality, poNo, vendor, agent, soNo, status);
    }

    @GetMapping("/filters")
    public Map<String, List<String>> filters() {
        return service.filters();
    }

    @GetMapping("/{id:\\d+}")
    public PurchaseOrderDetailResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderDetailResponse create(@Valid @RequestBody PurchaseOrderRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id:\\d+}")
    public PurchaseOrderDetailResponse update(@PathVariable Long id, @Valid @RequestBody PurchaseOrderRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id:\\d+}/status")
    public PurchaseOrderDetailResponse changeStatus(@PathVariable Long id, @RequestParam PurchaseOrderStatus value) {
        return service.changeStatus(id, value);
    }
}

package com.textile.salesorder.web;

import com.textile.salesorder.domain.OrderStatus;
import com.textile.salesorder.dto.PagedResponse;
import com.textile.salesorder.dto.SalesOrderRequest;
import com.textile.salesorder.dto.SalesOrderResponse;
import com.textile.salesorder.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService service;

    public SalesOrderController(SalesOrderService service) {
        this.service = service;
    }

    @GetMapping
    public PagedResponse<SalesOrderResponse> list(@RequestParam(required = false) String orderNo,
                                         @RequestParam(required = false) Long buyerId,
                                         @RequestParam(required = false) Long qualityId,
                                         @RequestParam(required = false) OrderStatus status,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                         @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        return service.search(orderNo, buyerId, qualityId, status, fromDate, toDate, page, size);
    }

    @GetMapping("/report")
    public PagedResponse<SalesOrderResponse> report(@RequestParam(required = false) String orderNo,
                                           @RequestParam(required = false) Long buyerId,
                                           @RequestParam(required = false) Long qualityId,
                                           @RequestParam(required = false) OrderStatus status,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                           @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return service.searchReport(orderNo, buyerId, qualityId, status, fromDate, toDate, page, size);
    }

    @GetMapping("/report/all")
    public List<SalesOrderResponse> reportAll(@RequestParam(required = false) String orderNo,
                                              @RequestParam(required = false) Long buyerId,
                                              @RequestParam(required = false) Long qualityId,
                                              @RequestParam(required = false) OrderStatus status,
                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                              @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.searchReportAll(orderNo, buyerId, qualityId, status, fromDate, toDate);
    }

    @GetMapping("/all")
    public List<SalesOrderResponse> listAll(@RequestParam(required = false) String orderNo,
                                            @RequestParam(required = false) Long buyerId,
                                            @RequestParam(required = false) Long qualityId,
                                            @RequestParam(required = false) OrderStatus status,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return service.searchAll(orderNo, buyerId, qualityId, status, fromDate, toDate);
    }

    @GetMapping("/{id:\\d+}")
    public SalesOrderResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SalesOrderResponse create(@Valid @RequestBody SalesOrderRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id:\\d+}")
    public SalesOrderResponse update(@PathVariable Long id, @Valid @RequestBody SalesOrderRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id:\\d+}/status")
    public SalesOrderResponse changeStatus(@PathVariable Long id, @RequestParam OrderStatus value) {
        return service.changeStatus(id, value);
    }
}

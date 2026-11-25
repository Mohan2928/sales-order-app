package com.textile.salesorder.web;

import com.textile.salesorder.dto.DispatchRequest;
import com.textile.salesorder.dto.DispatchResponse;
import com.textile.salesorder.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders/{orderId}/dispatches")
public class DispatchController {

    private final DispatchService service;

    public DispatchController(DispatchService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DispatchResponse create(@PathVariable Long orderId, @Valid @RequestBody DispatchRequest request) {
        return service.create(orderId, request);
    }

    @GetMapping
    public List<DispatchResponse> list(@PathVariable Long orderId) {
        return service.list(orderId);
    }
}

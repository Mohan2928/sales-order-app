package com.textile.salesorder.service;

import com.textile.salesorder.domain.Dispatch;
import com.textile.salesorder.domain.OrderStatus;
import com.textile.salesorder.domain.SalesOrder;
import com.textile.salesorder.domain.SalesOrderLine;
import com.textile.salesorder.dto.DispatchRequest;
import com.textile.salesorder.dto.DispatchResponse;
import com.textile.salesorder.repository.DispatchRepository;
import com.textile.salesorder.repository.SalesOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DispatchService {

    private final SalesOrderRepository orders;
    private final DispatchRepository dispatches;

    public DispatchService(SalesOrderRepository orders, DispatchRepository dispatches) {
        this.orders = orders;
        this.dispatches = dispatches;
    }

    @Transactional
    public DispatchResponse create(Long orderId, DispatchRequest req) {
        SalesOrder order = orders.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        SalesOrderLine line = order.getLines().stream()
                .filter(l -> l.getId() != null && l.getId().equals(req.lineId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Line does not belong to this order"));

        if (order.getStatus() != OrderStatus.MOVED_TO_PRODUCTION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dispatch is allowed only for orders that are Moved To Production");
        }

        BigDecimal dispatched = line.getDispatchQty() == null ? BigDecimal.ZERO : line.getDispatchQty();
        BigDecimal balance = line.getQuantity().subtract(dispatched);
        if (req.quantity().compareTo(balance) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Dispatch quantity exceeds balance (balance: " + balance.stripTrailingZeros().toPlainString() + " " + (line.getUom() == null ? "" : line.getUom()) + ")");
        }

        Dispatch d = new Dispatch();
        d.setSalesOrderLine(line);
        d.setDispatchDate(req.dispatchDate());
        d.setQuantity(req.quantity());
        d.setVehicleNo(req.vehicleNo());
        d.setChallanNo(req.challanNo());
        d.setRemarks(req.remarks());

        line.setDispatchQty(dispatched.add(req.quantity()));
        Dispatch saved = dispatches.save(d);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DispatchResponse> list(Long orderId) {
        return dispatches.findBySalesOrderLineSalesOrderIdOrderByDispatchDateDescIdDesc(orderId)
                .stream().map(this::toResponse).toList();
    }

    private DispatchResponse toResponse(Dispatch d) {
        SalesOrderLine l = d.getSalesOrderLine();
        return new DispatchResponse(
                d.getId(),
                l.getId(),
                l.getQuality() != null ? l.getQuality().getSortNumber() : null,
                l.getQuality() != null ? l.getQuality().getDescription() : null,
                l.getUom(),
                d.getDispatchDate(),
                d.getQuantity(),
                d.getVehicleNo(),
                d.getChallanNo(),
                d.getRemarks(),
                d.getCreatedAt());
    }
}

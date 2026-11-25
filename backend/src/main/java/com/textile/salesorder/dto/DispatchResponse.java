package com.textile.salesorder.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DispatchResponse(
        Long id,
        Long lineId,
        String sortNumber,
        String qualityDescription,
        String uom,
        LocalDate dispatchDate,
        BigDecimal quantity,
        String vehicleNo,
        String challanNo,
        String remarks,
        LocalDateTime createdAt) {
}

package com.textile.salesorder.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DispatchRequest(
        @NotNull Long lineId,
        @NotNull LocalDate dispatchDate,
        @NotNull @Positive BigDecimal quantity,
        String vehicleNo,
        String challanNo,
        String remarks) {
}

package com.ventas.orders_service.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record OrderResponse(
                Long id,
                Long customerId,
                BigDecimal total,
                String status,
                String orderNumber,
                LocalDateTime createdAt) {
}
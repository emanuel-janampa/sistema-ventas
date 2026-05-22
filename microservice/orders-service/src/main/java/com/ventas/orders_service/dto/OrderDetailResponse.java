package com.ventas.orders_service.dto;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record OrderDetailResponse(
        Long id,
        Long productId,
        Integer quantity,
        BigDecimal price,
        BigDecimal subtotal) {
}
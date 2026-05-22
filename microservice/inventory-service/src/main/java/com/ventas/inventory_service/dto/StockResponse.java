package com.ventas.inventory_service.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record StockResponse(
        Long id,
        Long productId,
        Integer quantity,
        LocalDateTime updatedAt) {
}
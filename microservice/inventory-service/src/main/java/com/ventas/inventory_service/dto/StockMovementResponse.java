package com.ventas.inventory_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String type;
    private Integer quantity;
    private String reason;
    private LocalDateTime createdAt;
}
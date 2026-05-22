package com.ventas.inventory_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Movement type is required (ENTRADA/SALIDA)")
    private String type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Reason is required (VENTA/REPOSICION)")
    private String reason;
}
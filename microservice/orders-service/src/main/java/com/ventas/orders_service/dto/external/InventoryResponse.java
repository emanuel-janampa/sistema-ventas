package com.ventas.orders_service.dto.external;

import lombok.Data;

@Data
public class InventoryResponse {
    private Long id;
    private Long productId;
    private Integer quantity;
}
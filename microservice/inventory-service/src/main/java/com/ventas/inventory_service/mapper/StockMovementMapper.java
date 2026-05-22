package com.ventas.inventory_service.mapper;

import com.ventas.inventory_service.dto.StockMovementRequest;
import com.ventas.inventory_service.dto.StockMovementResponse;
import com.ventas.inventory_service.entity.StockMovement;
import org.springframework.stereotype.Component;

@Component
public class StockMovementMapper {

    public StockMovement toEntity(StockMovementRequest request) {
        return StockMovement.builder()
                .productId(request.getProductId())
                .type(request.getType())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .build();
    }

    public StockMovementResponse toResponse(StockMovement movement) {
        return StockMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProductId())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .reason(movement.getReason())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
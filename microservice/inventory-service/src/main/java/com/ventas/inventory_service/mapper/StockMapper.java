package com.ventas.inventory_service.mapper;

import com.ventas.inventory_service.dto.StockRequest;
import com.ventas.inventory_service.dto.StockResponse;
import com.ventas.inventory_service.entity.Stock;
import org.springframework.stereotype.Component;

@Component
public class StockMapper {

    public Stock toEntity(StockRequest request) {
        return Stock.builder()
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .build();
    }

    public StockResponse toResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .productId(stock.getProductId())
                .quantity(stock.getQuantity())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}
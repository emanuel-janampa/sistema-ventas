package com.ventas.inventory_service.service;

import com.ventas.inventory_service.dto.StockMovementRequest;
import com.ventas.inventory_service.dto.StockMovementResponse;

import java.util.List;

public interface StockMovementService {

    StockMovementResponse create(StockMovementRequest request);

    List<StockMovementResponse> getAll();

    List<StockMovementResponse> getByProductId(Long productId);

    StockMovementResponse getById(Long id);
}
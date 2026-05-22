package com.ventas.inventory_service.service;

import com.ventas.inventory_service.dto.StockRequest;
import com.ventas.inventory_service.dto.StockResponse;

import java.util.List;

public interface StockService {

    StockResponse createOrUpdate(StockRequest request);

    StockResponse getByProductId(Long productId);

    List<StockResponse> getAll();

    void delete(Long id);

}
package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import com.ventas.orders_service.dto.external.InventoryResponse;
import com.ventas.orders_service.dto.external.StockMovementRequest;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@FeignClient(name = "inventory-service")
public interface InventoryClient {
    @GetMapping("/api/stock/{productId}")
    InventoryResponse getStock(@PathVariable("productId") Long productId);

    @PostMapping("/api/stock-movements")
    void createMovement(@RequestBody StockMovementRequest request);
}
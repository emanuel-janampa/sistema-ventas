package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.ventas.orders_service.dto.external.InventoryResponse;
import com.ventas.orders_service.dto.external.StockMovementRequest;
import com.ventas.orders_service.fallback.InventoryClientFallback;

@FeignClient(name = "inventory-service", fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @GetMapping("/api/stock/{productId}")
    InventoryResponse getStock(@PathVariable Long productId);

    @PostMapping("/api/stock-movements")
    void createMovement(@RequestBody StockMovementRequest request);
}
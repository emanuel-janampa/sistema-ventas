package com.ventas.orders_service.fallback;

import org.springframework.stereotype.Component;
import com.ventas.orders_service.client.InventoryClient;
import com.ventas.orders_service.dto.external.InventoryResponse;
import com.ventas.orders_service.dto.external.StockMovementRequest;
import com.ventas.orders_service.exception.ServiceUnavailableException;

@Component
public class InventoryClientFallback implements InventoryClient {

    @Override
    public InventoryResponse getStock(Long productId) {
        throw new ServiceUnavailableException("Inventory Service no disponible");
    }

    @Override
    public void createMovement(StockMovementRequest request) {
        throw new ServiceUnavailableException("Inventory Service no disponible");
    }
}
package com.ventas.orders_service.fallback;

import org.springframework.stereotype.Component;

import com.ventas.orders_service.client.ProductClient;
import com.ventas.orders_service.dto.external.ProductResponse;
import com.ventas.orders_service.exception.ServiceUnavailableException;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ProductResponse getById(Long id) {
        throw new ServiceUnavailableException("Products Service no disponible");
    }
}
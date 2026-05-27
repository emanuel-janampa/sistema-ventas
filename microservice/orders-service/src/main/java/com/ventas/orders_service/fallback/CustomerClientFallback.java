package com.ventas.orders_service.fallback;

import org.springframework.stereotype.Component;

import com.ventas.orders_service.client.CustomerClient;
import com.ventas.orders_service.dto.external.CustomerResponse;
import com.ventas.orders_service.exception.ServiceUnavailableException;

@Component
public class CustomerClientFallback implements CustomerClient {

    @Override
    public CustomerResponse getById(Long id) {
        throw new ServiceUnavailableException("Customers Service no disponible");
    }
}
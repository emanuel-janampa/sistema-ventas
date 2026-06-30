package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.ventas.orders_service.dto.external.CustomerResponse;
import com.ventas.orders_service.fallback.CustomerClientFallback;

@FeignClient(name = "customers-service", url = "http://customers-service:8084", fallback = CustomerClientFallback.class)
public interface CustomerClient {

    @GetMapping("/api/customers/{id}")
    CustomerResponse getById(@PathVariable("id") Long id);
}
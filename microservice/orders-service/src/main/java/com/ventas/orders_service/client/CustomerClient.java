package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.ventas.orders_service.dto.external.CustomerResponse;

@FeignClient(name = "customers-service")
public interface CustomerClient {
    @GetMapping("/api/customers/{id}")
    CustomerResponse getById(@PathVariable("id") Long id);
}
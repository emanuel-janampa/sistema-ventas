package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.ventas.orders_service.dto.external.ProductResponse;

@FeignClient(name = "products-service")
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getById(@PathVariable Long id);
}
package com.ventas.orders_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.ventas.orders_service.dto.external.ProductResponse;
import com.ventas.orders_service.fallback.ProductClientFallback;

@FeignClient(name = "products-service", fallback = ProductClientFallback.class)
public interface ProductClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getById(@PathVariable("id") Long id);
}
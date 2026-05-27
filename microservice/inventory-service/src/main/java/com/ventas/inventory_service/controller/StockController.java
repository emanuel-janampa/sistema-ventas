package com.ventas.inventory_service.controller;

import com.ventas.inventory_service.dto.StockRequest;
import com.ventas.inventory_service.dto.StockResponse;
import com.ventas.inventory_service.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    @Value("${server.port}")
    private String port;

    private final StockService service;

    @PostMapping
    public StockResponse createOrUpdate(@Valid @RequestBody StockRequest request) {
        return service.createOrUpdate(request);
    }

    @GetMapping("/{productId}")
    public StockResponse getByProduct(@PathVariable Long productId) {
        System.out.println("Respuesta desde inventory-service puerto: " + port);
        return service.getByProductId(productId);
    }

    @GetMapping
    public List<StockResponse> getAll() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
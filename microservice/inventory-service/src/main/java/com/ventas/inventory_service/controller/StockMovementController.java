package com.ventas.inventory_service.controller;

import com.ventas.inventory_service.dto.StockMovementRequest;
import com.ventas.inventory_service.dto.StockMovementResponse;
import com.ventas.inventory_service.service.StockMovementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService service;

    // ✅ CREAR
    @PostMapping
    public StockMovementResponse create(@Valid @RequestBody StockMovementRequest request) {
        return service.create(request);
    }

    // ✅ LISTAR TODOS
    @GetMapping
    public List<StockMovementResponse> getAll() {
        return service.getAll();
    }

    // ✅ 🔥 BUSCAR POR ID (LO QUE TE FALTABA)
    @GetMapping("/{id}")
    public StockMovementResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // ✅ BUSCAR POR PRODUCTO
    @GetMapping("/product/{productId}")
    public List<StockMovementResponse> getByProduct(@PathVariable Long productId) {
        return service.getByProductId(productId);
    }
}
package com.ventas.orders_service.controller;

import com.ventas.orders_service.dto.OrderDetailRequest;
import com.ventas.orders_service.dto.OrderDetailResponse;
import com.ventas.orders_service.service.OrderDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-details")
@RequiredArgsConstructor
public class OrderDetailController {

    private final OrderDetailService service;

    @PostMapping
    public OrderDetailResponse create(@Valid @RequestBody OrderDetailRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<OrderDetailResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/order/{orderId}")
    public List<OrderDetailResponse> getByOrderId(@PathVariable Long orderId) {
        return service.getByOrderId(orderId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
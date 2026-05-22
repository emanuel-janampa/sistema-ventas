package com.ventas.orders_service.service;

import com.ventas.orders_service.dto.OrderRequest;
import com.ventas.orders_service.dto.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse create(OrderRequest request);

    List<OrderResponse> getAll();

    OrderResponse getById(Long id);

    OrderResponse update(Long id, OrderRequest request);

    void delete(Long id);
}
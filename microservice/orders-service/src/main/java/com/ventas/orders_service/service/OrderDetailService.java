package com.ventas.orders_service.service;

import com.ventas.orders_service.dto.OrderDetailRequest;
import com.ventas.orders_service.dto.OrderDetailResponse;

import java.util.List;

public interface OrderDetailService {

    OrderDetailResponse create(OrderDetailRequest request);

    List<OrderDetailResponse> getAll();

    List<OrderDetailResponse> getByOrderId(Long orderId);

    void delete(Long id);
}
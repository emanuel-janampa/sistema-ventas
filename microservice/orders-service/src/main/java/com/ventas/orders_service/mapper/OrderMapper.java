package com.ventas.orders_service.mapper;

import com.ventas.orders_service.dto.OrderRequest;
import com.ventas.orders_service.dto.OrderResponse;
import com.ventas.orders_service.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequest request) {
        if (request == null) return null;

        return Order.builder()
                .customerId(request.getCustomerId())
                .build();
    }

    public OrderResponse toResponse(Order order) {
        if (order == null) return null;

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .total(order.getTotal())
                .status(order.getStatus().name())
                .orderNumber(order.getOrderNumber())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
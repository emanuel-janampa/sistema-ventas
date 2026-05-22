package com.ventas.orders_service.mapper;

import com.ventas.orders_service.dto.OrderDetailRequest;
import com.ventas.orders_service.dto.OrderDetailResponse;
import com.ventas.orders_service.entity.Order;
import com.ventas.orders_service.entity.OrderDetail;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderDetailMapper {

    public OrderDetail toEntity(OrderDetailRequest request, Order order) {

        BigDecimal subtotal = request.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        return OrderDetail.builder()
                .order(order)
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .subtotal(subtotal)
                .build();
    }

    public OrderDetailResponse toResponse(OrderDetail detail) {

        return OrderDetailResponse.builder()
                .id(detail.getId())
                .productId(detail.getProductId())
                .quantity(detail.getQuantity())
                .price(detail.getPrice())
                .subtotal(detail.getSubtotal())
                .build();
    }
}
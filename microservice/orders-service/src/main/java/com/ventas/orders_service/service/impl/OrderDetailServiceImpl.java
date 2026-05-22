package com.ventas.orders_service.service.impl;

import com.ventas.orders_service.dto.OrderDetailRequest;
import com.ventas.orders_service.dto.OrderDetailResponse;
import com.ventas.orders_service.entity.Order;
import com.ventas.orders_service.entity.OrderDetail;
import com.ventas.orders_service.mapper.OrderDetailMapper;
import com.ventas.orders_service.repository.OrderDetailRepository;
import com.ventas.orders_service.repository.OrderRepository;
import com.ventas.orders_service.service.OrderDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository repository;
    private final OrderDetailMapper mapper;
    private final OrderRepository orderRepository;

    @Override
    public OrderDetailResponse create(OrderDetailRequest request) {

        validate(request);

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderDetail detail = mapper.toEntity(request, order);

        return mapper.toResponse(repository.save(detail));
    }

    @Override
    public List<OrderDetailResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public List<OrderDetailResponse> getByOrderId(Long orderId) {
        return repository.findByOrderId(orderId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Order detail not found");
        }
        repository.deleteById(id);
    }

    private void validate(OrderDetailRequest request) {

        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (request.getPrice() == null || request.getPrice().doubleValue() <= 0) {
            throw new RuntimeException("Price must be greater than 0");
        }
    }
}
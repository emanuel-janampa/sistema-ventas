package com.ventas.orders_service.service.impl;

import com.ventas.orders_service.client.CustomerClient;
import com.ventas.orders_service.client.InventoryClient;
import com.ventas.orders_service.client.ProductClient;
import com.ventas.orders_service.dto.OrderItemRequest;
import com.ventas.orders_service.dto.OrderRequest;
import com.ventas.orders_service.dto.OrderResponse;
import com.ventas.orders_service.dto.external.InventoryResponse;
import com.ventas.orders_service.dto.external.ProductResponse;
import com.ventas.orders_service.dto.external.StockMovementRequest;
import com.ventas.orders_service.entity.Order;
import com.ventas.orders_service.entity.OrderDetail;
import com.ventas.orders_service.entity.OrderStatus;
import com.ventas.orders_service.exception.ResourceNotFoundException;
import com.ventas.orders_service.mapper.OrderMapper;
import com.ventas.orders_service.repository.OrderDetailRepository;
import com.ventas.orders_service.repository.OrderRepository;
import com.ventas.orders_service.service.OrderService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

        private final OrderRepository repository;
        private final OrderDetailRepository detailRepository;
        private final OrderMapper mapper;

        private final ProductClient productClient;
        private final InventoryClient inventoryClient;
        private final CustomerClient customerClient;

        // =========================
        // CREATE ORDER
        // =========================
        @Override
        @Transactional
        @CircuitBreaker(name = "ordersCircuit", fallbackMethod = "createFallback")
        public OrderResponse create(OrderRequest request) {

                validateRequest(request);

                customerClient.getById(request.getCustomerId());

                BigDecimal totalOrder = BigDecimal.ZERO;

                for (OrderItemRequest item : request.getItems()) {

                        ProductResponse product = productClient.getById(item.getProductId());
                        InventoryResponse stock = inventoryClient.getStock(item.getProductId());

                        if (stock.getQuantity() < item.getQuantity()) {
                                throw new RuntimeException("Insufficient stock for product: " + product.getName());
                        }

                        BigDecimal subtotal = product.getPrice()
                                        .multiply(BigDecimal.valueOf(item.getQuantity()));

                        totalOrder = totalOrder.add(subtotal);
                }

                Order order = Order.builder()
                                .customerId(request.getCustomerId())
                                .total(totalOrder)
                                .status(OrderStatus.valueOf(
                                                request.getStatus() != null ? request.getStatus().toUpperCase()
                                                                : "PENDING"))
                                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .build();

                Order savedOrder = repository.save(order);

                for (OrderItemRequest item : request.getItems()) {

                        ProductResponse product = productClient.getById(item.getProductId());

                        StockMovementRequest movement = StockMovementRequest.builder()
                                        .productId(item.getProductId())
                                        .type("SALIDA")
                                        .quantity(item.getQuantity())
                                        .reason("VENTA")
                                        .build();

                        inventoryClient.createMovement(movement);

                        OrderDetail detail = OrderDetail.builder()
                                        .order(savedOrder)
                                        .productId(item.getProductId())
                                        .quantity(item.getQuantity())
                                        .price(product.getPrice())
                                        .subtotal(product.getPrice()
                                                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                                        .build();

                        detailRepository.save(detail);
                }

                return mapper.toResponse(savedOrder);
        }

        // =========================
        // FALLBACK CREATE
        // =========================
        public OrderResponse createFallback(OrderRequest request, Throwable ex) {

                log.error("ORDER SERVICE FALLBACK ACTIVATED: {}", ex.getMessage());

                return OrderResponse.builder()
                                .id(null)
                                .customerId(request.getCustomerId())
                                .total(BigDecimal.ZERO)
                                .status("SERVICE_UNAVAILABLE")
                                .orderNumber("FALLBACK")
                                .createdAt(null)
                                .build();
        }

        // =========================
        // GET ALL
        // =========================
        @Override
        public List<OrderResponse> getAll() {
                return repository.findAll().stream().map(mapper::toResponse).toList();
        }

        // =========================
        // GET BY ID
        // =========================
        @Override
        public OrderResponse getById(Long id) {
                Order order = repository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
                return mapper.toResponse(order);
        }

        // =========================
        // UPDATE
        // =========================
        @Override
        public OrderResponse update(Long id, OrderRequest request) {

                Order order = repository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                order.setCustomerId(request.getCustomerId());

                if (request.getStatus() != null) {
                        order.setStatus(OrderStatus.valueOf(request.getStatus().toUpperCase()));
                }

                return mapper.toResponse(repository.save(order));
        }

        // =========================
        // DELETE
        // =========================
        @Override
        public void delete(Long id) {
                repository.deleteById(id);
        }

        private void validateRequest(OrderRequest request) {
                if (request.getCustomerId() == null || request.getCustomerId() <= 0) {
                        throw new RuntimeException("Invalid customer ID");
                }
                if (request.getItems() == null || request.getItems().isEmpty()) {
                        throw new RuntimeException("Order must contain items");
                }
        }
}
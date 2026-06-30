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
        public OrderResponse create(OrderRequest request) {

                validateRequest(request);

                try {
                        log.info("Fetching customer with ID: {}", request.getCustomerId());
                        customerClient.getById(request.getCustomerId());
                } catch (Exception e) {
                        log.error("Error fetching customer: {}", e.getMessage(), e);
                        throw new RuntimeException("Customer not found: " + request.getCustomerId());
                }

                BigDecimal totalOrder = BigDecimal.ZERO;

                for (OrderItemRequest item : request.getItems()) {

                        try {
                                log.info("Fetching product with ID: {}", item.getProductId());
                                ProductResponse product = productClient.getById(item.getProductId());
                                log.info("Fetching stock for product: {}", item.getProductId());
                                InventoryResponse stock = inventoryClient.getStock(item.getProductId());

                                if (stock.getQuantity() < item.getQuantity()) {
                                        throw new RuntimeException(
                                                        "Insufficient stock for product: " + product.getName());
                                }

                                BigDecimal subtotal = product.getPrice()
                                                .multiply(BigDecimal.valueOf(item.getQuantity()));

                                totalOrder = totalOrder.add(subtotal);
                        } catch (Exception e) {
                                log.error("Error processing item {}: {}", item.getProductId(), e.getMessage(), e);
                                throw new RuntimeException("Error al procesar producto " + item.getProductId() + ": "
                                                + e.getMessage());
                        }
                }

                Order order = Order.builder()
                                .customerId(request.getCustomerId())
                                .total(totalOrder)
                                .status(OrderStatus.valueOf(
                                                request.getStatus() != null ? request.getStatus().toUpperCase()
                                                                : "PENDING"))
                                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                                .build();

                log.info("Saving order: {}", order.getOrderNumber());
                Order savedOrder = repository.save(order);

                for (OrderItemRequest item : request.getItems()) {

                        try {
                                ProductResponse product = productClient.getById(item.getProductId());

                                StockMovementRequest movement = StockMovementRequest.builder()
                                                .productId(item.getProductId())
                                                .type("SALIDA")
                                                .quantity(item.getQuantity())
                                                .reason("VENTA")
                                                .build();

                                log.info("Creating stock movement for product {}: quantity {}", item.getProductId(),
                                                item.getQuantity());
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
                                log.info("Saved order detail for product: {}", item.getProductId());
                        } catch (Exception e) {
                                log.error("Error saving order detail for product {}: {}", item.getProductId(),
                                                e.getMessage(), e);
                                throw new RuntimeException("Error al guardar detalle de orden: " + e.getMessage());
                        }
                }

                log.info("Order created successfully: {}", savedOrder.getId());
                return mapper.toResponse(savedOrder);

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
        public OrderResponse update(Long id, com.ventas.orders_service.dto.OrderStatusRequest request) {

                Order order = repository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
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
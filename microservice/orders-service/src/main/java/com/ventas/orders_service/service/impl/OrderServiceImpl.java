package com.ventas.orders_service.service.impl;

import com.ventas.orders_service.client.*;
import com.ventas.orders_service.dto.*;
import com.ventas.orders_service.dto.external.*;
import com.ventas.orders_service.entity.*;
import com.ventas.orders_service.mapper.OrderMapper;
import com.ventas.orders_service.repository.*;
import com.ventas.orders_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;
    private final OrderDetailRepository detailRepository; // Necesario para guardar los items
    private final OrderMapper mapper;
    
    // Inyección de Clientes Feign
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final CustomerClient customerClient;

    @Override
    @Transactional // CRÍTICO: Si falla Inventory, se hace rollback de la Order
    public OrderResponse create(OrderRequest request) {
        validateRequest(request);
        try {
            customerClient.getById(request.getCustomerId());
        } catch (Exception e) {
            // Aquí tú controlas exactamente qué dice el error
            throw new RuntimeException("Cliente no encontrado");
        }
        BigDecimal totalOrder = BigDecimal.ZERO;

        // 1. PRIMERA PASADA: Validación de existencia y stock (No guardamos nada aún)
        for (OrderItemRequest item : request.getItems()) {
            ProductResponse product = productClient.getById(item.getProductId());
            InventoryResponse stock = inventoryClient.getStock(item.getProductId());

            if (stock.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalOrder = totalOrder.add(subtotal);
        }

        // 2. CREAR CABECERA DE LA ORDEN
        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .total(totalOrder)
                .status(OrderStatus.PENDING)
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        
        Order savedOrder = repository.save(order);

        // 3. SEGUNDA PASADA: Registrar Movimientos en Inventory y Guardar Detalles
        for (OrderItemRequest item : request.getItems()) {
            ProductResponse product = productClient.getById(item.getProductId());

            // A. Registrar SALIDA en Inventory (Tu motor de movimientos)
            StockMovementRequest movement = StockMovementRequest.builder()
                    .productId(item.getProductId())
                    .type("SALIDA")
                    .quantity(item.getQuantity())
                    .reason("VENTA")
                    .build();
            
            inventoryClient.createMovement(movement);

            // B. Guardar Detalle en la DB de Orders
            OrderDetail detail = OrderDetail.builder()
                    .order(savedOrder)
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .build();
            
            detailRepository.save(detail);
        }

        return mapper.toResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public OrderResponse getById(Long id) {

        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return mapper.toResponse(order);
    }

    @Override
    public OrderResponse update(Long id, OrderRequest request) {

        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new RuntimeException("Only PENDING orders can be updated");
        }

        // SOLO permitimos cambiar el cliente (opcional)
        order.setCustomerId(request.getCustomerId());

        return mapper.toResponse(repository.save(order));
    }

    @Override
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Order not found");
        }

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
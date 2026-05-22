package com.ventas.inventory_service.service.impl;

import com.ventas.inventory_service.dto.StockMovementRequest;
import com.ventas.inventory_service.dto.StockMovementResponse;
import com.ventas.inventory_service.dto.StockRequest;
import com.ventas.inventory_service.dto.StockResponse;
import com.ventas.inventory_service.entity.StockMovement;
import com.ventas.inventory_service.mapper.StockMovementMapper;
import com.ventas.inventory_service.repository.StockMovementRepository;
import com.ventas.inventory_service.service.StockMovementService;
import com.ventas.inventory_service.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementServiceImpl implements StockMovementService {

    private static final String IN = "ENTRADA";
    private static final String OUT = "SALIDA";

    private final StockMovementRepository repository;
    private final StockMovementMapper mapper;
    private final StockService stockService;

    @Override
    @Transactional
    public StockMovementResponse create(StockMovementRequest request) {

        validateRequest(request);

        Integer currentQuantity = 0;

        StockResponse currentStock = null;

        try {
            currentStock = stockService.getByProductId(request.getProductId());
            currentQuantity = currentStock.quantity();
        } catch (RuntimeException e) {
            if (request.getType().equalsIgnoreCase(OUT)) {
                throw new RuntimeException(
                        "No existe stock para este producto, no se puede realizar salida.");
            }
        }

        Integer newQuantity;

        if (request.getType().equalsIgnoreCase(IN)) {
            newQuantity = currentQuantity + request.getQuantity();
        } else if (request.getType().equalsIgnoreCase(OUT)) {
            newQuantity = currentQuantity - request.getQuantity();
        } else {
            throw new RuntimeException("Tipo inválido. Use ENTRADA o SALIDA.");
        }

        if (newQuantity < 0) {
            throw new RuntimeException(
                    "Stock insuficiente. Disponible: " + currentQuantity);
        }

        stockService.createOrUpdate(
                StockRequest.builder()
                        .productId(request.getProductId())
                        .quantity(newQuantity)
                        .build());

        StockMovement movement = mapper.toEntity(request);

        return mapper.toResponse(repository.save(movement));
    }

    @Override
    public List<StockMovementResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public List<StockMovementResponse> getByProductId(Long productId) {
        return repository.findByProductId(productId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    private void validateRequest(StockMovementRequest request) {

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (request.getType() == null) {
            throw new RuntimeException("Type is required");
        }
    }

    @Override
    public StockMovementResponse getById(Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));
    }
}
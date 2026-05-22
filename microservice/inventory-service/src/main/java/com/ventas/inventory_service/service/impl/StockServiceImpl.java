package com.ventas.inventory_service.service.impl;

import com.ventas.inventory_service.dto.StockRequest;
import com.ventas.inventory_service.dto.StockResponse;
import com.ventas.inventory_service.entity.Stock;
import com.ventas.inventory_service.mapper.StockMapper;
import com.ventas.inventory_service.repository.StockRepository;
import com.ventas.inventory_service.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository repository;
    private final StockMapper mapper;

    @Override
    public StockResponse createOrUpdate(StockRequest request) {

        validateQuantity(request.getQuantity());

        Stock stock = repository.findByProductId(request.getProductId())
                .orElse(null);

        if (stock == null) {
            stock = mapper.toEntity(request);
        } else {
            stock.setQuantity(request.getQuantity());
        }

        return mapper.toResponse(repository.save(stock));
    }

    public StockResponse update(Long productId, StockRequest request) {

        validateQuantity(request.getQuantity());

        Stock stock = repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Stock no encontrado"));

        stock.setQuantity(request.getQuantity());

        return mapper.toResponse(repository.save(stock));
    }

    @Override
    public StockResponse getByProductId(Long productId) {

        Stock stock = repository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Stock no encontrado"));

        return mapper.toResponse(stock);
    }

    @Override
    public List<StockResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Stock no encontrado");
        }

        repository.deleteById(id);
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new RuntimeException("Quantity must be 0 or greater");
        }
    }
}
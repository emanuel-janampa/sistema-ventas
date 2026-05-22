package com.ventas.products_service.service;

import com.ventas.products_service.dto.ProductRequest;
import com.ventas.products_service.dto.ProductResponse;
import java.util.List;

public interface ProductService {
    ProductResponse create(ProductRequest request);

    List<ProductResponse> getAll();

    ProductResponse getById(Long id);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
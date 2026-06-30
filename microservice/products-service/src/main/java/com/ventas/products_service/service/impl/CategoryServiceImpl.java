package com.ventas.products_service.service.impl;

import com.ventas.products_service.dto.CategoryRequest;
import com.ventas.products_service.dto.CategoryResponse;
import com.ventas.products_service.entity.Category;
import com.ventas.products_service.mapper.CategoryMapper;
import com.ventas.products_service.repository.CategoryRepository;
import com.ventas.products_service.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;

    @Override
    public CategoryResponse create(CategoryRequest request) {

        if (repository.existsByName(request.getName())) {
            throw new RuntimeException("La categoría ya existe");
        }

        Category category = mapper.toEntity(request);

        return mapper.toResponse(repository.save(category));
    }

    @Override
    public List<CategoryResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getById(Long id) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        return mapper.toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {

        Category category = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        if (!category.getName().equalsIgnoreCase(request.getName()) && repository.existsByName(request.getName())) {
            throw new RuntimeException("La categoría ya existe");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return mapper.toResponse(repository.save(category));
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Categoría no encontrada");
        }
        repository.deleteById(id);
    }
}
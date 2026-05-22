package com.ventas.products_service.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CategoryResponse(
                Long id,
                String name,
                String description,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}
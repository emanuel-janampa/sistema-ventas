package com.ventas.customers_service.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record CustomerResponse(
                Long id,
                String firstName,
                String lastName,
                String email,
                String phone,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}
package com.ventas.customers_service.dto;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record UserResponse(
        Long id,
        String username,
        String role,
        Long customerId,
        LocalDateTime createdAt) {
}
package com.ventas.orders_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List; // Importante

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be positive")
    private Long customerId;

    private List<OrderItemRequest> items;

    private String status;
}
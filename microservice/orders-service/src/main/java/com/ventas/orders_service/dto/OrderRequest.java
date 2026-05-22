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


    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items; 
}
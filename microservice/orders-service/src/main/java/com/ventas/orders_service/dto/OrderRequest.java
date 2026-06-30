package com.ventas.orders_service.dto;

import jakarta.validation.Valid;
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

    @Valid
    @NotEmpty(message = "La orden debe contener al menos un item")
    private List<OrderItemRequest> items;

    @Pattern(regexp = "^(?i)(PENDING|PAID|CANCELED)$", message = "El estado debe ser PENDING, PAID o CANCELED")
    private String status;
}
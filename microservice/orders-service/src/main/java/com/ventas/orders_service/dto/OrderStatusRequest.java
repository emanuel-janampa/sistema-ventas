package com.ventas.orders_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusRequest {

    @NotBlank(message = "El estado es requerido")
    @Pattern(regexp = "(?i)^(PENDING|PAID|CANCELED)$", message = "El estado debe ser PENDING, PAID o CANCELED")
    private String status;
}

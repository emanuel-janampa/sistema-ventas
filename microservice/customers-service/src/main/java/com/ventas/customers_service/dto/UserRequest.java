package com.ventas.customers_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Se requiere un nombre de usuario")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    private String username;

    @Size(max = 100, message = "La contraseña debe tener como máximo 100 caracteres")
    private String password;

    @NotBlank(message = "Se requiere un rol")
    @Pattern(regexp = "^(ADMIN|CUSTOMER)$", message = "El rol debe ser ADMIN o CUSTOMER")
    private String role;

    @NotNull(message = "Se requiere un id de cliente")
    @Positive(message = "El id de cliente debe ser un número positivo")
    private Long customerId;
}
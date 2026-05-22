package com.ventas.customers_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Se requiere un nombre de usuario")
    private String username;

    @NotBlank(message = "Se requiere una contraseña")
    private String password;

    @NotBlank(message = "Se requiere un rol")
    private String role;

    @NotNull(message = "se requiere un id de cliente")
    private Long customerId;
}
package com.ventas.customers_service.controller;

import com.ventas.customers_service.dto.LoginRequest;
import com.ventas.customers_service.dto.LoginResponse;
import com.ventas.customers_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}
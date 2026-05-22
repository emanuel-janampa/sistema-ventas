package com.ventas.customers_service.service;

import com.ventas.customers_service.dto.LoginRequest;
import com.ventas.customers_service.dto.LoginResponse;
import com.ventas.customers_service.dto.UserRequest;
import com.ventas.customers_service.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse create(UserRequest request);

    List<UserResponse> getAll();

    UserResponse getById(Long id);

    UserResponse update(Long id, UserRequest request);

    void delete(Long id);

    LoginResponse login(LoginRequest request);
}
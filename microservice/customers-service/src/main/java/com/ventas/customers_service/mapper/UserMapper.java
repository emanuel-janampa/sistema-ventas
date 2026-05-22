package com.ventas.customers_service.mapper;

import com.ventas.customers_service.dto.UserResponse;
import com.ventas.customers_service.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {

        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .customerId(
                        user.getCustomer() != null
                                ? user.getCustomer().getId()
                                : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
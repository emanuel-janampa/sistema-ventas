package com.ventas.customers_service.config;

import com.ventas.customers_service.entity.User;
import com.ventas.customers_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeed implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String username = "admin";
        String password = "123456";
        String role = "ADMIN";

        if (userRepository.existsByUsername(username)) {
            log.info("Usuario administrador ya existe: {}", username);
            return;
        }

        User adminUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();

        userRepository.save(adminUser);
        log.info("Usuario administrador creado automáticamente: {} / {}", username, password);
    }
}

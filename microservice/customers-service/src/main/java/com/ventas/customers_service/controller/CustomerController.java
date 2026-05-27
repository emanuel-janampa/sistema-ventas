package com.ventas.customers_service.controller;

import com.ventas.customers_service.dto.CustomerRequest;
import com.ventas.customers_service.dto.CustomerResponse;
import com.ventas.customers_service.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    @Value("${server.port}")
    private String port;

    private final CustomerService service;

    @PostMapping
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<CustomerResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public CustomerResponse getById(@PathVariable Long id) {
        System.out.println("Respuesta desde puerto: " + port);
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
package com.ventas.customers_service.service.impl;

import com.ventas.customers_service.dto.CustomerRequest;
import com.ventas.customers_service.dto.CustomerResponse;
import com.ventas.customers_service.entity.Customer;
import com.ventas.customers_service.mapper.CustomerMapper;
import com.ventas.customers_service.repository.CustomerRepository;
import com.ventas.customers_service.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;
    private final CustomerMapper mapper;

    @Override
    public CustomerResponse create(CustomerRequest request) {

        String normalizedEmail = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String normalizedPhone = request.getPhone() == null ? null : request.getPhone().trim();

        if (repository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (normalizedPhone != null && repository.existsByPhone(normalizedPhone)) {
            throw new RuntimeException("El teléfono ya está registrado");
        }

        Customer customer = mapper.toEntity(request);
        return mapper.toResponse(repository.save(customer));
    }

    @Override
    public List<CustomerResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public CustomerResponse getById(Long id) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        return mapper.toResponse(customer);
    }

    @Override
    public CustomerResponse update(Long id, CustomerRequest request) {

        Customer customer = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("cliente no encontrado"));
        String normalizedEmail = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String normalizedPhone = request.getPhone() == null ? null : request.getPhone().trim();

        if (!customer.getEmail().equalsIgnoreCase(normalizedEmail)
                && repository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("El correo ya registrado");
        }

        if (normalizedPhone != null && !normalizedPhone.equals(customer.getPhone())
                && repository.existsByPhone(normalizedPhone)) {
            throw new RuntimeException("El teléfono ya está registrado");
        }

        customer.setFirstName(request.getFirstName().trim());
        customer.setLastName(request.getLastName().trim());
        customer.setEmail(normalizedEmail);
        customer.setPhone(normalizedPhone);

        return mapper.toResponse(repository.save(customer));
    }

    @Override
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("cliente no encontrado");
        }

        repository.deleteById(id);
    }
}
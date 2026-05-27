package com.ventas.orders_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public Map<String, Object> handleValidationErrors(MethodArgumentNotValidException ex) {

                Map<String, String> errors = new HashMap<>();

                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

                return Map.of(
                                "errors", errors,
                                "timestamp", LocalDateTime.now());
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        public Map<String, Object> handleNotFound(
                        ResourceNotFoundException ex) {

                return Map.of(
                                "error", ex.getMessage(),
                                "timestamp", LocalDateTime.now());
        }

        @ExceptionHandler(io.github.resilience4j.circuitbreaker.CallNotPermittedException.class)
        @ResponseStatus(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE)
        public Map<String, Object> handleOpenCircuit(
                        io.github.resilience4j.circuitbreaker.CallNotPermittedException ex) {
                return Map.of(
                                "error",
                                "El circuito está abierto. El servicio externo no responde y se denegó la comunicación para evitar sobrecargas.",
                                "timestamp", LocalDateTime.now());
        }

        @ExceptionHandler(feign.FeignException.class)
        @ResponseStatus(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE)
        public Map<String, Object> handleFeignException(feign.FeignException ex) {
                return Map.of(
                                "error",
                                "Error de comunicación con el servicio externo de forma directa: " + ex.getMessage(),
                                "timestamp", LocalDateTime.now());
        }
}
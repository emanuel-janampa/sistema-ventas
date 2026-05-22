package com.ventas.orders_service.dto.external;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProductResponse {
    private Long id;
    private String name;    
    private BigDecimal price; 
}
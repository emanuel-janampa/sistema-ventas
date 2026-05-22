package com.ventas.products_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {

        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Long categoryId;
        private String categoryName;
        private LocalDateTime createdAt;
}
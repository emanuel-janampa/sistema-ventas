package com.ventas.inventory_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String type; // ENTRADA, SALIDA

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String reason; // VENTA, REPOSICION

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
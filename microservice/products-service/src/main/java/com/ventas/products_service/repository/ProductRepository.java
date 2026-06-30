package com.ventas.products_service.repository;

import com.ventas.products_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p " +
            "WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(:name)) AND p.category.id = :categoryId")
    boolean existsByNameIgnoreCaseAndCategoryId(@Param("name") String name, @Param("categoryId") Long categoryId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p " +
            "WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(:name)) AND p.category.id = :categoryId AND p.id <> :id")
    boolean existsByNameIgnoreCaseAndCategoryIdAndIdNot(@Param("name") String name,
            @Param("categoryId") Long categoryId, @Param("id") Long id);
}
package com.globetrotter.globetrotterbackend.repository;

import com.globetrotter.globetrotterbackend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByNameContainingIgnoreCase(String name);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByCategoryAndPriceRange(@Param("categoryId") Long categoryId,
                                              @Param("minPrice") Double minPrice,
                                              @Param("maxPrice") Double maxPrice);

    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    List<Product> findByOrderByPriceAsc();

    List<Product> findByOrderByPriceDesc();

    List<Product> findByOrderByRatingDesc();
}
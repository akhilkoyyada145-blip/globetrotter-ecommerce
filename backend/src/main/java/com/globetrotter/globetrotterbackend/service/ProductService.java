package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.Product;
import java.util.List;
import java.util.Optional;

public interface ProductService {

    Product createProduct(Product product);

    List<Product> getAllProducts();

    Optional<Product> getProductById(Long id);

    List<Product> getProductsByCategory(Long categoryId);

    List<Product> searchProducts(String keyword);

    List<Product> getProductsByPriceRange(Double minPrice, Double maxPrice);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    List<Product> getProductsSortedByPrice(boolean ascending);

    List<Product> getTopRatedProducts();
}
package com.globetrotter.globetrotterbackend.controller;

import com.globetrotter.globetrotterbackend.model.Product;
import com.globetrotter.globetrotterbackend.model.Category;
import com.globetrotter.globetrotterbackend.service.ProductService;
import com.globetrotter.globetrotterbackend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/price-range")
    public ResponseEntity<List<Product>> getProductsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    @GetMapping("/sorted")
    public ResponseEntity<List<Product>> getProductsSorted(@RequestParam boolean ascending) {
        return ResponseEntity.ok(productService.getProductsSortedByPrice(ascending));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Product>> getTopRatedProducts() {
        return ResponseEntity.ok(productService.getTopRatedProducts());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> productData) {
        Product product = new Product();
        product.setName((String) productData.get("name"));
        product.setDescription((String) productData.get("description"));
        product.setPrice(((Number) productData.get("price")).doubleValue());
        product.setStockQuantity(((Number) productData.get("stockQuantity")).intValue());
        product.setImageUrl((String) productData.get("imageUrl"));

        Long categoryId = ((Number) productData.get("categoryId")).longValue();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);

        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> productData) {
        Product productDetails = new Product();
        productDetails.setName((String) productData.get("name"));
        productDetails.setDescription((String) productData.get("description"));
        productDetails.setPrice(((Number) productData.get("price")).doubleValue());
        productDetails.setStockQuantity(((Number) productData.get("stockQuantity")).intValue());
        productDetails.setImageUrl((String) productData.get("imageUrl"));

        Long categoryId = ((Number) productData.get("categoryId")).longValue();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        productDetails.setCategory(category);

        return ResponseEntity.ok(productService.updateProduct(id, productDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
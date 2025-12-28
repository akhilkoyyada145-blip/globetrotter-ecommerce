package com.globetrotter.globetrotterbackend.controller;

import com.globetrotter.globetrotterbackend.dto.AddToCartRequest;
import com.globetrotter.globetrotterbackend.model.Cart;
import com.globetrotter.globetrotterbackend.model.CartItem;
import com.globetrotter.globetrotterbackend.model.User;
import com.globetrotter.globetrotterbackend.service.CartService;
import com.globetrotter.globetrotterbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartService.getCartByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(cartService.getOrCreateCart(user.getId())));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody AddToCartRequest request,
                                              Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem item = cartService.addToCart(user.getId(), request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(item);
    }

    @PutMapping("/update")
    public ResponseEntity<CartItem> updateCartItem(@RequestBody AddToCartRequest request,
                                                   Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem item = cartService.updateCartItemQuantity(user.getId(), request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId,
                                            Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        cartService.removeFromCart(user.getId(), productId);
        return ResponseEntity.ok("Item removed from cart");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        cartService.clearCart(user.getId());
        return ResponseEntity.ok("Cart cleared");
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getCartTotal(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(cartService.getCartTotal(user.getId()));
    }
}
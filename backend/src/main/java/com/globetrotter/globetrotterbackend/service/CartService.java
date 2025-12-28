package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.Cart;
import com.globetrotter.globetrotterbackend.model.CartItem;
import java.util.Optional;

public interface CartService {

    Cart getOrCreateCart(Long userId);

    CartItem addToCart(Long userId, Long productId, Integer quantity);

    CartItem updateCartItemQuantity(Long userId, Long productId, Integer quantity);

    void removeFromCart(Long userId, Long productId);

    void clearCart(Long userId);

    Optional<Cart> getCartByUserId(Long userId);

    Double getCartTotal(Long userId);
}
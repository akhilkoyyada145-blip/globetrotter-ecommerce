package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {

    Order createOrder(Long userId, String shippingAddress, String paymentMethod);

    List<Order> getUserOrders(Long userId);

    Optional<Order> getOrderById(Long orderId);

    Order updateOrderStatus(Long orderId, Order.OrderStatus status);

    List<Order> getAllOrders();

    List<Order> getOrdersByStatus(Order.OrderStatus status);
}
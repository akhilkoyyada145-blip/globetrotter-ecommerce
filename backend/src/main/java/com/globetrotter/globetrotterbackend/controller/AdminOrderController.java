package com.globetrotter.globetrotterbackend.controller;

import com.globetrotter.globetrotterbackend.model.Order;
import com.globetrotter.globetrotterbackend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    // Get all NON-ARCHIVED orders from all customers (for admin dashboard)
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findByArchivedFalseOrderByOrderDateDesc();
        return ResponseEntity.ok(orders);
    }

    // Update order status
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Convert string to OrderStatus enum
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(orderStatus);

        Order updatedOrder = orderRepository.save(order);

        return ResponseEntity.ok(updatedOrder);
    }

    // Archive all orders (mark as archived instead of deleting)
    @DeleteMapping("/clear")
    public ResponseEntity<String> archiveAllOrders() {
        List<Order> orders = orderRepository.findByArchivedFalseOrderByOrderDateDesc();
        for (Order order : orders) {
            order.setArchived(true);
        }
        orderRepository.saveAll(orders);
        return ResponseEntity.ok("All orders archived successfully");
    }
}
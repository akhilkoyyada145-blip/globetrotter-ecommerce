package com.globetrotter.globetrotterbackend.repository;

import com.globetrotter.globetrotterbackend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    List<Order> findByStatus(Order.OrderStatus status);

    // NEW: Find non-archived orders sorted by date
    List<Order> findByArchivedFalseOrderByOrderDateDesc();
}
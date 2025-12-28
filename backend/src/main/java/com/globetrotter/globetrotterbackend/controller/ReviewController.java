package com.globetrotter.globetrotterbackend.controller;

import com.globetrotter.globetrotterbackend.dto.ReviewRequest;
import com.globetrotter.globetrotterbackend.model.Review;
import com.globetrotter.globetrotterbackend.model.User;
import com.globetrotter.globetrotterbackend.service.ReviewService;
import com.globetrotter.globetrotterbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequest request,
                                          Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Review review = reviewService.createReview(
                    user.getId(),
                    request.getProductId(),
                    request.getRating(),
                    request.getComment()
            );
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<Review>> getUserReviews(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(reviewService.getUserReviews(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
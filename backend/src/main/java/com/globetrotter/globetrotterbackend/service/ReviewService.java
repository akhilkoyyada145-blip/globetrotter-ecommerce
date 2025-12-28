package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.Review;
import java.util.List;
import java.util.Optional;

public interface ReviewService {

    Review createReview(Long userId, Long productId, Integer rating, String comment);

    List<Review> getProductReviews(Long productId);

    List<Review> getUserReviews(Long userId);

    Optional<Review> getReviewById(Long id);

    void deleteReview(Long id);

    boolean hasUserReviewedProduct(Long userId, Long productId);
}
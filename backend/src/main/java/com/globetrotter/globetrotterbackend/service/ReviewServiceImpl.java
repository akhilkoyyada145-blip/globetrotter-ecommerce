package com.globetrotter.globetrotterbackend.service;

import com.globetrotter.globetrotterbackend.model.Product;
import com.globetrotter.globetrotterbackend.model.Review;
import com.globetrotter.globetrotterbackend.model.User;
import com.globetrotter.globetrotterbackend.repository.ProductRepository;
import com.globetrotter.globetrotterbackend.repository.ReviewRepository;
import com.globetrotter.globetrotterbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Review createReview(Long userId, Long productId, Integer rating, String comment) {
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(rating);
        review.setComment(comment);

        Review savedReview = reviewRepository.save(review);

        // Update product rating
        updateProductRating(productId);

        return savedReview;
    }

    private void updateProductRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        product.setRating(averageRating);
        product.setReviewsCount(reviews.size());
        productRepository.save(product);
    }

    @Override
    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public List<Review> getUserReviews(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Override
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    @Override
    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.existsByProductIdAndUserId(productId, userId);
    }
}
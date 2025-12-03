package RM.ReadMate.service;

import RM.ReadMate.dto.ReviewDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.Review;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.ReviewRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Transactional
    public ReviewDto addReview(Long bookId, String username, String content, int rating) {
        User user = userRepository.findByUserid(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found"));

        Review review = new Review();
        review.setBook(book);
        review.setUser(user);
        review.setContent(content);
        review.setRating(rating);

        Review savedReview = reviewRepository.save(review);

        return new ReviewDto(savedReview);
    }

    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));

        User user = userRepository.findByUserid(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this review.");
        }

        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsByUserId(Long userId) {
        List<Review> reviews = reviewRepository.findByUserId(userId);
        return reviews.stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUserid(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
    }
}
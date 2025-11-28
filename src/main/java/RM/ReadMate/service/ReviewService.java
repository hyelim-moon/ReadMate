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
}
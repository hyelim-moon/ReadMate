package RM.ReadMate.dto;

import RM.ReadMate.entity.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private Long bookId;
    private String bookName; // 책 이름 추가
    private String bookImage; // 책 이미지 추가
    private Long userId;
    private String content;
    private int rating;
    private String nickname;
    private String createdAt;

    public ReviewDto(Review review) {
        this.id = review.getId();
        this.bookId = review.getBook().getId();
        this.bookName = review.getBook().getBookName(); // 책 이름 설정
        this.bookImage = review.getBook().getBookImage(); // 책 이미지 설정
        this.userId = review.getUser().getId();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.nickname = review.getUser().getNickname();
        if (review.getCreatedAt() != null) {
            this.createdAt = review.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
    }
}
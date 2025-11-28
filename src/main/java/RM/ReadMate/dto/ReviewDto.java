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
    private String content;
    private int rating;
    private String nickname;
    private String createdAt;

    public ReviewDto(Review review) {
        this.id = review.getId();
        this.bookId = review.getBook().getId();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.nickname = review.getUser().getNickname();
        if (review.getCreatedAt() != null) {
            this.createdAt = review.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
    }
}
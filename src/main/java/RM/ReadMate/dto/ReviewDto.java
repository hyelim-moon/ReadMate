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
    private Long userId; // 작성자 ID 추가
    private String content;
    private int rating;
    private String nickname;
    private String createdAt;

    public ReviewDto(Review review) {
        this.id = review.getId();
        this.bookId = review.getBook().getId();
        this.userId = review.getUser().getId(); // 작성자 ID 설정
        this.content = review.getContent();
        this.rating = review.getRating();
        this.nickname = review.getUser().getNickname();
        if (review.getCreatedAt() != null) {
            this.createdAt = review.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
    }
}
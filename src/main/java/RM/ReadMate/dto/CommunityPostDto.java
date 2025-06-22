package RM.ReadMate.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommunityPostDto {
    private Long id;
    private String title;
    private String content;
    private String tags;
    private String imagePath;
    private Integer likes;
    private Boolean liked;      // 좋아요 여부 추가
    private String timeAgo;
    private LocalDateTime createdAt;
    private String authorId;    // 작성자 ID 추가

    public CommunityPostDto(Long id, String title, String content, String tags,
                            String imagePath, Integer likes, Boolean liked,
                            String timeAgo, LocalDateTime createdAt, String authorId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.imagePath = imagePath;
        this.likes = likes;
        this.liked = liked;
        this.timeAgo = timeAgo;
        this.createdAt = createdAt;
        this.authorId = authorId;
    }
}

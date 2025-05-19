package RM.ReadMate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Data
public class CommunityPostDto {
    private Long id;
    private String title;
    private String content;
    private String tags;
    private String imagePath;
    private Integer likes;
    private String timeAgo;
    private LocalDateTime createdAt;  // 추가

    public CommunityPostDto(Long id, String title, String content, String tags,
                            String imagePath, Integer likes, String timeAgo, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.imagePath = imagePath;
        this.likes = likes;
        this.timeAgo = timeAgo;
        this.createdAt = createdAt;
    }

    // getter, setter 생략
}

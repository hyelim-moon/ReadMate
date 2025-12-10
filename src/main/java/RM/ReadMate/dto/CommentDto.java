package RM.ReadMate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private String content;
    private String authorId;
    private String createdAt;
    private Long parentId; // ⭐ 부모 댓글 ID (null이면 일반댓글)
}

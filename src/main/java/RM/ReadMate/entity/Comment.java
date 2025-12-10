package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private String authorId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;   // 부모 댓글 (null이면 일반 댓글)

    // 대댓글 리스트 (부모가 삭제될 때 같이 삭제되도록 cascade + orphanRemoval 권장)
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();
    // 대댓글 리스트
    // (DB에서는 parent_id로 구분, JSON 응답 시 프론트에서 depth 계산 가능)

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

/*
package RM.ReadMate.entity;

import jakarta.persistence.*;
        import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 게시글과 연관
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private String authorId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 🔹 대댓글 구조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id") // 부모 댓글
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Comment> replies = new ArrayList<>(); // 대댓글 리스트

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
*/

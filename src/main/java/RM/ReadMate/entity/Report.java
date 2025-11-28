package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporter; // 신고한 사용자

    @Column(nullable = false)
    private String reason; // 신고 사유

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime reportedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING; // 신고 처리 상태 (대기, 처리됨 등)

    public enum ReportStatus {
        PENDING,    // 대기 중
        RESOLVED,   // 처리 완료
        REJECTED    // 반려됨
    }
}

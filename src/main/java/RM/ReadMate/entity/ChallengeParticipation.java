package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class ChallengeParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    private LocalDate participationDate;
    private boolean isRewardClaimed = false;

    @Column(nullable = false)
    private String status = "진행중"; // 챌린지 상태 (진행중, 달성, 완료, 실패)

    private Integer finalProgress; // 챌린지 종료 시점의 진행도

    private boolean isCompleted = false; // 완료 여부 필드 (상태 영구성 판단)
}

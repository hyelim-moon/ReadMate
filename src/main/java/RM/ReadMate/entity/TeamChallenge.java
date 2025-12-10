package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate; // LocalDate 임포트 추가

@Entity
@Getter
@Setter
@NoArgsConstructor
public class TeamChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamChallengeId;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    // Challenge 엔티티와의 관계를 제거하고 필드를 직접 포함
    private String challengeTitle;
    private String challengeDescription;
    private LocalDate startDate;
    private LocalDate endDate;
    private int goalQuantity;
    // private int reward; // 필요하다면 추가 (현재는 TeamChallengeService에서 0으로 설정)

    private Long leaderId; // 방장의 User ID 추가

    private int progress; // 팀 전체의 진행 상황 (예: 팀이 읽은 총 책 수)
}

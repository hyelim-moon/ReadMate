package RM.ReadMate.dto;

import RM.ReadMate.entity.Challenge;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private int reward;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private long participants;
    private int currentProgress;
    private int goal;
    private String relatedLink;
    private String relatedLinkText;
    private boolean isRewardClaimed; // 보상 수령 여부 필드 추가

    public ChallengeDTO(Challenge challenge, String status, long participants) {
        this.id = challenge.getId();
        this.title = challenge.getTitle();
        this.description = challenge.getDescription();
        this.reward = challenge.getReward();
        this.startDate = challenge.getStartDate();
        this.endDate = challenge.getEndDate();
        this.status = status;
        this.participants = participants;
        this.currentProgress = 0;
        this.goal = 0;
        this.isRewardClaimed = false; // 기본값 설정
    }

    public ChallengeDTO(Challenge challenge, String status, long participants, int currentProgress, int goal) {
        this(challenge, status, participants);
        this.currentProgress = currentProgress;
        this.goal = goal;
    }

    // 모든 필드를 포함하는 생성자 (isRewardClaimed 추가)
    public ChallengeDTO(Challenge challenge, String status, long participants, int currentProgress, int goal, String relatedLink, String relatedLinkText, boolean isRewardClaimed) {
        this(challenge, status, participants, currentProgress, goal);
        this.relatedLink = relatedLink;
        this.relatedLinkText = relatedLinkText;
        this.isRewardClaimed = isRewardClaimed;
    }
}

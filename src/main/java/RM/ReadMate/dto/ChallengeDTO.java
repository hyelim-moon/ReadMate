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

    public ChallengeDTO(Challenge challenge, String status, long participants) {
        this.id = challenge.getId();
        this.title = challenge.getTitle();
        this.description = challenge.getDescription();
        this.reward = challenge.getReward();
        this.startDate = challenge.getStartDate();
        this.endDate = challenge.getEndDate();
        this.status = status;
        this.participants = participants;
    }
}

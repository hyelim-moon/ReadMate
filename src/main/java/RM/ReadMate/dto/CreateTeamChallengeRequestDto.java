package RM.ReadMate.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CreateTeamChallengeRequestDto {
    private String roomName;
    private List<Long> invitedFriendIds;
    private String challengeTitle; // 챌린지 제목
    private String challengeDescription; // 챌린지 설명
    private LocalDate endDate; // 챌린지 종료 날짜
    private int goalQuantity; // 챌린지 목표 수량
}

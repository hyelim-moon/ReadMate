package RM.ReadMate.dto;

import RM.ReadMate.entity.Team;
import RM.ReadMate.entity.TeamChallenge;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TeamChallengeDto {
    private Long teamChallengeId;
    private String roomName;
    private String challengeTitle;
    private String challengeDescription;
    private LocalDate startDate;
    private LocalDate endDate;
    private int goalQuantity;
    private int currentMembers;
    private int maxMembers;
    private Long leaderId; // 방장 ID 추가
    private List<TeamMemberProgressDto> membersProgress;

    public TeamChallengeDto(TeamChallenge teamChallenge) {
        this.teamChallengeId = teamChallenge.getTeamChallengeId();
        this.leaderId = teamChallenge.getLeaderId(); // 방장 ID 설정
        
        Team team = teamChallenge.getTeam();

        if (team != null) {
            this.roomName = team.getName();
            this.currentMembers = team.getMembers() != null ? team.getMembers().size() : 0;
            this.membersProgress = null; 
        } else {
            this.roomName = "알 수 없는 방";
            this.currentMembers = 0;
            this.membersProgress = null;
        }

        this.challengeTitle = teamChallenge.getChallengeTitle();
        this.challengeDescription = teamChallenge.getChallengeDescription();
        this.startDate = teamChallenge.getStartDate();
        this.endDate = teamChallenge.getEndDate();
        this.goalQuantity = teamChallenge.getGoalQuantity();
        
        this.maxMembers = 10; // 임시로 하드코딩
    }

    // 상세 조회 시 멤버 진행 상황을 채우기 위한 생성자
    public TeamChallengeDto(TeamChallenge teamChallenge, List<TeamMemberProgressDto> membersProgress) {
        this(teamChallenge); // 기본 생성자 호출
        this.membersProgress = membersProgress;
    }
}

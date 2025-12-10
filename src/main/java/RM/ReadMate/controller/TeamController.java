package RM.ReadMate.controller;

import RM.ReadMate.entity.Team;
import RM.ReadMate.entity.TeamChallenge; // 제거 예정
import RM.ReadMate.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public Team createTeam(@RequestParam String name, @RequestParam Long leaderId) {
        return teamService.createTeam(name, leaderId);
    }

    @PostMapping("/{teamId}/members")
    public Team addMember(@PathVariable Long teamId, @RequestParam Long userId) {
        return teamService.addMember(teamId, userId);
    }

    // joinChallenge 엔드포인트 제거
    /*
    @PostMapping("/{teamId}/challenges")
    public TeamChallenge joinChallenge(@PathVariable Long teamId, @RequestParam Long challengeId) {
        return teamService.joinChallenge(teamId, challengeId);
    }
    */

    @GetMapping
    public List<Team> getTeams() {
        return teamService.getTeams();
    }

    // getTeamChallenges 엔드포인트 제거 (TeamChallengeService로 이동)
    /*
    @GetMapping("/{teamId}/challenges")
    public List<TeamChallenge> getTeamChallenges(@PathVariable Long teamId) {
        return teamService.getTeamChallenges(teamId);
    }
    */
}

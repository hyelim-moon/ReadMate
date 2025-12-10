package RM.ReadMate.controller;

import RM.ReadMate.dto.CreateTeamChallengeRequestDto;
import RM.ReadMate.dto.TeamChallengeDto;
import RM.ReadMate.entity.TeamChallenge;
import RM.ReadMate.service.TeamChallengeService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team-challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TeamChallengeController {

    private final TeamChallengeService teamChallengeService;

    @GetMapping
    public ResponseEntity<List<TeamChallengeDto>> getAllTeamChallenges() {
        List<TeamChallengeDto> teamChallenges = teamChallengeService.getAllTeamChallenges();
        return ResponseEntity.ok(teamChallenges);
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createTeamChallenge(@RequestBody CreateTeamChallengeRequestDto requestDto) {
        TeamChallenge teamChallenge = teamChallengeService.createTeamChallenge(requestDto);
        // 생성된 teamChallengeId를 초대 코드로 사용
        String invitationCode = String.valueOf(teamChallenge.getTeamChallengeId());
        return ResponseEntity.ok(Map.of("invitationCode", invitationCode));
    }

    // 특정 팀 챌린지 상세 정보 조회
    @GetMapping("/{teamChallengeId}")
    public ResponseEntity<TeamChallengeDto> getTeamChallengeDetails(@PathVariable Long teamChallengeId) {
        TeamChallengeDto details = teamChallengeService.getTeamChallengeDetails(teamChallengeId);
        return ResponseEntity.ok(details);
    }

    // 팀 챌린지 참여
    @PostMapping("/{teamChallengeId}/join")
    public ResponseEntity<Map<String, String>> joinTeamChallenge(@PathVariable Long teamChallengeId) {
        try {
            teamChallengeService.joinTeamChallenge(teamChallengeId);
            return ResponseEntity.ok(Map.of("message", "팀 챌린지에 성공적으로 참여했습니다."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "팀 챌린지 참여 중 오류가 발생했습니다."));
        }
    }

    // 팀 경쟁 수정
    @PutMapping("/{teamChallengeId}")
    public ResponseEntity<Map<String, String>> updateTeamChallenge(
            @PathVariable Long teamChallengeId,
            @RequestBody CreateTeamChallengeRequestDto requestDto) {
        try {
            teamChallengeService.updateTeamChallenge(teamChallengeId, requestDto);
            return ResponseEntity.ok(Map.of("message", "팀 챌린지가 성공적으로 수정되었습니다."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "팀 챌린지 수정 중 오류가 발생했습니다."));
        }
    }

    // 팀 경쟁 삭제
    @DeleteMapping("/{teamChallengeId}")
    public ResponseEntity<Map<String, String>> deleteTeamChallenge(@PathVariable Long teamChallengeId) {
        try {
            teamChallengeService.deleteTeamChallenge(teamChallengeId);
            return ResponseEntity.ok(Map.of("message", "팀 챌린지가 성공적으로 삭제되었습니다."));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "팀 챌린지 삭제 중 오류가 발생했습니다."));
        }
    }
}

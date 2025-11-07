package RM.ReadMate.controller;

import RM.ReadMate.dto.ChallengeDTO;
import RM.ReadMate.security.JwtTokenProvider;
import RM.ReadMate.service.ChallengeService;
import RM.ReadMate.service.UserService; // UserService import 추가
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}) // 모든 오리진과 메서드 허용 (임시)
public class ChallengeController {

    private final ChallengeService challengeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService; // UserService 주입

    @Autowired
    public ChallengeController(ChallengeService challengeService, JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.challengeService = challengeService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService; // UserService 초기화
    }

    @GetMapping
    public List<ChallengeDTO> getChallenges() {
        return challengeService.getChallenges();
    }

    @PostMapping("/{challengeId}/participate")
    public ResponseEntity<?> participateInChallenge(
            @PathVariable Long challengeId,
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.replace("Bearer ", "");
            String useridString = jwtTokenProvider.getUseridFromToken(token); // String userid
            Long userId = userService.findByUserid(useridString).getId(); // User 객체에서 실제 Long id 추출

            challengeService.participateInChallenge(challengeId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-progress")
    public ResponseEntity<List<ChallengeDTO>> getMyChallengeProgress(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String useridString = jwtTokenProvider.getUseridFromToken(token); // String userid
        Long userId = userService.findByUserid(useridString).getId(); // User 객체에서 실제 Long id 추출

        List<ChallengeDTO> myProgress = challengeService.getMyChallengeProgress(userId);
        return ResponseEntity.ok(myProgress);
    }

    @GetMapping("/{challengeId}/details")
    public ResponseEntity<ChallengeDTO> getChallengeDetails(
            @PathVariable Long challengeId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.replace("Bearer ", "");
            String useridString = jwtTokenProvider.getUseridFromToken(token); // String userid
            userId = userService.findByUserid(useridString).getId(); // User 객체에서 실제 Long id 추출
        }

        ChallengeDTO challengeDetails = challengeService.getChallengeDetailsForUser(challengeId, userId);
        return ResponseEntity.ok(challengeDetails);
    }

    @PostMapping("/{challengeId}/claim-reward")
    public ResponseEntity<?> claimReward(
            @PathVariable Long challengeId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String useridString = jwtTokenProvider.getUseridFromToken(token);
            Long userId = userService.findByUserid(useridString).getId();

            ChallengeDTO updatedChallenge = challengeService.claimChallengeReward(challengeId, userId);
            return ResponseEntity.ok(updatedChallenge);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{challengeId}/abandon") // DELETE 메서드로 변경
    public ResponseEntity<?> abandonChallenge(
            @PathVariable Long challengeId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String useridString = jwtTokenProvider.getUseridFromToken(token);
            Long userId = userService.findByUserid(useridString).getId();

            challengeService.abandonChallenge(challengeId, userId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}

package RM.ReadMate.controller;

import RM.ReadMate.dto.ChallengeDTO;
import RM.ReadMate.security.JwtTokenProvider;
import RM.ReadMate.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:3000")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public ChallengeController(ChallengeService challengeService, JwtTokenProvider jwtTokenProvider) {
        this.challengeService = challengeService;
        this.jwtTokenProvider = jwtTokenProvider;
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
            String userIdString = jwtTokenProvider.getUseridFromToken(token);
            Long userId = Long.parseLong(userIdString);

            challengeService.participateInChallenge(challengeId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }
}

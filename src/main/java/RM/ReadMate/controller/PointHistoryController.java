package RM.ReadMate.controller;

import RM.ReadMate.entity.PointHistory;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.PointHistoryRepository;
import RM.ReadMate.security.JwtTokenProvider;
import RM.ReadMate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/point-history")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PointHistoryController {

    private final PointHistoryRepository pointHistoryRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<?> getPointHistory(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "").trim();
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);
            User user = userService.findByUserid(userid);
            List<PointHistory> history = pointHistoryRepository.findByUserOrderByTransactionDateDesc(user);

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("포인트 내역 조회 중 오류 발생: " + e.getMessage());
        }
    }
}

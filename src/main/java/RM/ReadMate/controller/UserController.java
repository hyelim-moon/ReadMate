package RM.ReadMate.controller;

import RM.ReadMate.dto.UserRankingDTO;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // CORS 허용
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // 사용자 기본 정보 반환
    @GetMapping("/info")
    public Map<String, String> getUserInfo() {
        return Map.of("username", "booklover_91");
    }

    // 사용자 랭킹 정보 반환 (상위 10명)
    @GetMapping("/ranking")
    public List<UserRankingDTO> getUserRanking() {
        List<User> topUsers = userRepository.findTop10ByOrderByPointsDesc();

        return IntStream.range(0, topUsers.size())
                .mapToObj(i -> new UserRankingDTO(
                        i + 1,
                        topUsers.get(i).getNickname(),
                        topUsers.get(i).getPoints()))
                .toList();
    }

    // 사용자 포인트 조회 API 추가
    @GetMapping("/{userId}/points")
    public Map<String, Integer> getUserPoints(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        int points = userOpt.map(User::getPoints).orElse(0);
        return Map.of("points", points);
    }
}

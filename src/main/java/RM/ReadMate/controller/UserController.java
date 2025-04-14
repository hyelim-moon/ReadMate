package RM.ReadMate.controller;

import RM.ReadMate.dto.UserRankingDTO;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // CORS 허용
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 사용자 기본 정보 반환
    @GetMapping("/info")
    public Map<String, String> getUserInfo() {
        return Map.of("username", "booklover_91");
    }

    // 사용자 랭킹 정보 반환
    @GetMapping("/ranking")
    public List<UserRankingDTO> getUserRanking() {
        List<User> users = userRepository.findAllByOrderByPointsDesc();
        List<UserRankingDTO> rankingList = new ArrayList<>();

        for (int i = 0; i < users.size(); i++) {
            rankingList.add(new UserRankingDTO(i + 1, users.get(i).getNickname()));
        }

        return rankingList;
    }
}

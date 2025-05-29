package RM.ReadMate.service;

import RM.ReadMate.dto.UserRankingDTO;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 기존 랭킹 조회 메서드
    public UserRankingDTO getUserRanking(Long userId) {
        // 포인트 기준으로 상위 10명 가져오기
        List<User> users = userRepository.findTop10ByOrderByPointsDesc();

        // 유저가 랭킹에 있는지 확인
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(userId)) {
                User user = users.get(i);
                return new UserRankingDTO(i + 1, user.getNickname(), user.getPoints());
            }
        }

        // 못 찾았을 경우
        return new UserRankingDTO(0, "Unknown", 0);
    }

    // 추가: 특정 유저의 포인트 조회 메서드
    public int getPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return user.getPoints(); // User 엔티티에 points 필드가 있다고 가정
    }
}

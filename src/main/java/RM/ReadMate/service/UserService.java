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

    public UserRankingDTO getUserRanking(Long userId) {
        // 모든 유저를 포인트 순으로 정렬 (예시)
        List<User> users = userRepository.findAllByOrderByPointsDesc();

        // 랭킹 찾기
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(userId)) {
                return new UserRankingDTO(i + 1, users.get(i).getNickname());
            }
        }

        // 못 찾으면 기본값
        return new UserRankingDTO(0, "Unknown");
    }
}

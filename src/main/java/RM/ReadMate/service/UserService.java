package RM.ReadMate.service;

import RM.ReadMate.dto.UserRankingDTO;
import RM.ReadMate.entity.PointHistory;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.PointHistoryRepository;
import RM.ReadMate.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PointHistoryRepository pointHistoryRepository;

    public User findByUserid(String userid) {
        return userRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("User not found with userid: " + userid));
    }

    public UserRankingDTO getUserRanking(Long userId) {
        List<User> users = userRepository.findTop10ByOrderByPointsDesc();
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(userId)) {
                User user = users.get(i);
                return new UserRankingDTO(i + 1, user.getNickname(), user.getPoints());
            }
        }
        return new UserRankingDTO(0, "Unknown", 0);
    }

    public int getPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        return user.getPoints();
    }

    @Transactional
    public void addPoints(Long userId, int points) {
        addPoints(userId, points, "포인트 적립");
    }

    @Transactional
    public void addPoints(Long userId, int points, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        user.addPoints(points);
        userRepository.save(user);

        PointHistory history = PointHistory.builder()
                .user(user)
                .amount(points)
                .reason(reason)
                .transactionDate(LocalDateTime.now())
                .build();
        pointHistoryRepository.save(history);
    }

    public User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
    }

    // 닉네임으로 사용자 검색
    public List<User> searchUsersByNickname(String nickname) {
        return userRepository.findByNicknameContainingIgnoreCase(nickname);
    }
}

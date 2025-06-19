package RM.ReadMate.controller;

import RM.ReadMate.dto.LoginResponse;
import RM.ReadMate.dto.PurchaseDTO;
import RM.ReadMate.dto.UserRankingDTO;
import RM.ReadMate.dto.UserUpdateRequestDTO;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.service.PurchaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    private final PurchaseService purchaseService;

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

    // 추가된 메서드: 현재 로그인된 사용자의 정보 반환
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String userid = authentication.getName();
        Optional<User> userOpt = userRepository.findByUserid(userid);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOpt.get();
        Map<String, Object> profile = Map.of(
                "username", user.getUserid(),
                "nickname", user.getNickname(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "birthDate", user.getBirthdate(),
                "coupons", 0,
                "mileage", user.getPoints(),
                "wishlist", List.of(),
                "recent", List.of()
        );

        return ResponseEntity.ok(profile);
    }


    @PutMapping("/me")
    public ResponseEntity<LoginResponse.UserDTO> updateMyProfile(
            Authentication authentication,
            @RequestBody UserUpdateRequestDTO updateRequest) {

        String userid = authentication.getName();
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자 정보 없음"));

        user.setNickname(updateRequest.getNickname());
        user.setEmail(updateRequest.getEmail());
        user.setPhone(updateRequest.getPhone());
        user.setBirthdate(updateRequest.getBirthdate());
        user.setName(updateRequest.getName());

        userRepository.save(user);

        return ResponseEntity.ok(new LoginResponse.UserDTO(user));
    }

    /*@GetMapping("/purchases")
    public ResponseEntity<?> getUserPurchases(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body("로그인이 필요합니다");
        }
        String userid = authentication.getName();
        List<PurchaseDTO> purchases = purchaseService.getPurchasesByUserId(userid);
        return ResponseEntity.ok(purchases);
    }*/

}

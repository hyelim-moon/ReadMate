package RM.ReadMate.controller;

import RM.ReadMate.service.PointShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/points")
@CrossOrigin(origins = "http://localhost:3000")
public class PointShopController {

    private final PointShopService pointShopService;

    public PointShopController(PointShopService pointShopService){
        this.pointShopService = pointShopService;
    }

    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseProduct(@RequestParam Long productId, Authentication authentication) {
        System.out.println("Authentication 객체: " + authentication);
        if (authentication == null || !authentication.isAuthenticated()) {
            System.out.println("인증 정보 없음 또는 인증 실패");
            return ResponseEntity.status(403).body("권한이 없습니다");
        }

        try {
            String userId = authentication.getName();
            System.out.println("인증된 사용자 ID: " + userId);
            pointShopService.purchaseProduct(userId, productId);
            return ResponseEntity.ok("구매 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("구매 중 오류 발생: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyPoints(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(403).body("로그인이 필요합니다");
        }

        try {
            String userId = authentication.getName();
            int points = pointShopService.getUserPoints(userId);
            return ResponseEntity.ok().body(points);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("포인트 조회 중 오류 발생: " + e.getMessage());
        }
    }

}

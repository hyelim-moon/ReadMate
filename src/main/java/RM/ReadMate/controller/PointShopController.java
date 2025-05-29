package RM.ReadMate.controller;

import RM.ReadMate.service.PointShopService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> purchaseProduct(@RequestParam Long userId, @RequestParam Long productId) {
        try {
            pointShopService.purchaseProduct(userId, productId);
            return ResponseEntity.ok("구매 완료");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e){
            return ResponseEntity.internalServerError().body("구매 중 오류 발생: " + e.getMessage());
        }
    }
}

package RM.ReadMate.controller;

import RM.ReadMate.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")  // 필요 시 CORS 설정
public class CrawlProductController {

    private final ProductService productService;

    public CrawlProductController(ProductService productService){
        this.productService = productService;
    }

    @GetMapping("/api/crawl-products/kyobo")
    public ResponseEntity<?> getKyoboGiftCards() {
        try {
            List<Map<String, String>> giftCards = productService.kyoboGiftCards();
            return ResponseEntity.ok(giftCards);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("교보문고 크롤링 중 오류 발생");
        }
    }
}

package RM.ReadMate.controller;

import RM.ReadMate.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")  // 상품 관련 API 경로
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    // 기존 DB 기반 전체 상품 조회 API
    @GetMapping
    public List<?> getProducts() {
        // 필요 없으면 productService.getAllProducts() 대신 크롤링 데이터 반환해도 됨
        try {
            return productService.kyoboGiftCards();
        } catch (IOException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // 기존 DB 기반 상품 상세 조회 API 삭제 또는 주석 처리
//    @GetMapping("/{id}")
//    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
//        Product product = productService.getProductById(id);
//        if (product != null) {
//            return ResponseEntity.ok(product);
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    // 크롤링한 상품 목록 반환 API
    @GetMapping("/kyobogiftcards")
    public ResponseEntity<?> getGiftCards() {
        try {
            var giftCards = productService.kyoboGiftCards();
            return ResponseEntity.ok(giftCards);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("교보 크롤링 중 오류 발생");
        }
    }

    // 크롤링 데이터 기반 개별 상품 상세 조회 API 추가 (id는 배열 인덱스)
    @GetMapping("/kyobogiftcards/{id}")
    public ResponseEntity<?> getGiftCardById(@PathVariable int id) {
        try {
            var giftCards = productService.kyoboGiftCards();
            if (id < 0 || id >= giftCards.size()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(giftCards.get(id));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("교보 크롤링 중 오류 발생");
        }
    }
}

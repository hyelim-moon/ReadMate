package RM.ReadMate.controller;

import RM.ReadMate.entity.Product;
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

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 크롤링한 교보문고 기프트카드 목록 반환 API
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
}

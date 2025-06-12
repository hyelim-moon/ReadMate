//package RM.ReadMate.controller;
//
//import RM.ReadMate.entity.Product;
//import RM.ReadMate.service.ProductService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.io.IOException;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@CrossOrigin(origins = "http://localhost:3000")  // 필요 시 CORS 설정
//public class CrawlProductController {
//
//    private final ProductService productService;
//
//    public CrawlProductController(ProductService productService){
//        this.productService = productService;
//    }
//
//    @GetMapping("/api/crawl-products/kyobo")
//    public ResponseEntity<?> getKyoboGiftCards() {
//        try {
//            System.out.println("크롤링 API 호출됨!");
//            List<Product> products = productService.kyoboGiftCards();
//
//            // List<Product> -> List<Map<String, String>> 변환
//            List<Map<String, String>> giftCards = products.stream().map(p -> Map.of(
//                    "name", p.getName(),
//                    "price", String.valueOf(p.getPrice()),
//                    "image", p.getImage(),
//                    "description", p.getDescription()
//            )).toList();
//
//            return ResponseEntity.ok(giftCards);
//        } catch (IOException e) {
//            e.printStackTrace();
//            return ResponseEntity.status(500).body("교보문고 크롤링 중 오류 발생");
//        }
//    }
//}

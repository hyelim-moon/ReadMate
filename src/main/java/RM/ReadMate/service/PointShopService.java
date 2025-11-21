package RM.ReadMate.service;

import RM.ReadMate.entity.PointHistory;
import RM.ReadMate.entity.Product;
import RM.ReadMate.entity.Purchase;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.PointHistoryRepository;
import RM.ReadMate.repository.ProductRepository;
import RM.ReadMate.repository.PurchaseRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PointShopService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PurchaseRepository purchaseRepository;
    private final PointHistoryRepository pointHistoryRepository;

    @Transactional
    public void purchaseProduct(String userId, Long productId) {
        User user = userRepository.findByUserid(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (user.getPoints() < product.getPrice()) {
            throw new IllegalArgumentException("포인트가 부족합니다.");
        }

        // 포인트 차감
        user.setPoints(user.getPoints() - product.getPrice());
        userRepository.save(user);

        // 포인트 사용 내역 기록
        PointHistory history = PointHistory.builder()
                .user(user)
                .amount(-product.getPrice())
                .reason("상품 구매: " + product.getName())
                .transactionDate(LocalDateTime.now())
                .build();
        pointHistoryRepository.save(history);

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setProductName(product.getName());
        purchase.setPrice(product.getPrice());
        purchase.setPointsUsed(product.getPrice());
        purchase.setPurchaseDate(new java.util.Date());
        purchase.setStatus("구매 완료");
        purchaseRepository.save(purchase);
    }

    public int getUserPoints(String userId) {
        User user = userRepository.findByUserid(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return user.getPoints();
    }
}

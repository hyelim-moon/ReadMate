package RM.ReadMate.service;

import RM.ReadMate.entity.Product;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.ProductRepository;
import RM.ReadMate.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PointShopService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public PointShopService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void purchaseProduct(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if(user.getPoints() < product.getPrice()){
            throw new IllegalArgumentException("포인트가 부족합니다.");
        }

        // 포인트 차감
        user.setPoints(user.getPoints() - product.getPrice());
        userRepository.save(user);

        // TODO: 구매 내역 저장 등 추가 작업
    }
}

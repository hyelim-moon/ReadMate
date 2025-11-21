package RM.ReadMate.service;

import RM.ReadMate.dto.PurchaseDTO;
import RM.ReadMate.entity.Purchase;
import RM.ReadMate.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;

    public List<PurchaseDTO> getPurchasesByUserId(String userid) {
        List<Purchase> purchases = purchaseRepository.findByUserUserid(userid); // Repository에서 조회

        return purchases.stream()
                .map(p -> new PurchaseDTO(
                        p.getId(),
                        p.getProductName(),
                        p.getPurchaseDate(),
                        p.getPrice(),
                        p.getPointsUsed(),
                        p.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public int getAvailableCouponCount(String userid) {
        return (int) purchaseRepository.findByUserUserid(userid).stream()
                .filter(p -> "구매 완료".equals(p.getStatus())) // productName 필터링 조건 제거
                .count();
    }
}

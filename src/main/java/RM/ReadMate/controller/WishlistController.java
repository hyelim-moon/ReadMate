package RM.ReadMate.controller;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // ✅ 찜 추가
    @PostMapping("/{bookId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable Long bookId, Authentication authentication) {
        wishlistService.addToWishlist(authentication.getName(), bookId);
        return ResponseEntity.ok().build();
    }

    // ✅ 찜 제거
    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long bookId, Authentication authentication) {
        wishlistService.removeFromWishlist(authentication.getName(), bookId);
        return ResponseEntity.ok().build();
    }

    // ✅ 찜 목록 조회
    @GetMapping
    public ResponseEntity<List<BookDto>> getWishlist(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.getWishlist(authentication.getName()));
    }

    // ✅ 찜 여부 확인
    @GetMapping("/check")
    public ResponseEntity<Boolean> isBookWished(@RequestParam Long bookId, Authentication authentication) {
        boolean wished = wishlistService.isBookWished(authentication.getName(), bookId);
        return ResponseEntity.ok(wished);
    }
}

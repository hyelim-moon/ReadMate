package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.User;
import RM.ReadMate.entity.Wishlist;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    // ✅ 찜 추가
    public void addToWishlist(String userid, Long bookId) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("책 없음"));

        if (!wishlistRepository.existsByUserAndBook(user, book)) {
            wishlistRepository.save(Wishlist.builder()
                    .user(user)
                    .book(book)
                    .build());
        }
    }

    // ✅ 찜 삭제
    @Transactional
    public void removeFromWishlist(String userid, Long bookId) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("책 없음"));

        wishlistRepository.deleteByUserAndBook(user, book);
    }

    // ✅ 찜 목록 조회
    public List<BookDto> getWishlist(String userid) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        return wishlistRepository.findByUser(user).stream()
                .map(w -> BookDto.fromEntity(w.getBook()))
                .collect(Collectors.toList());
    }

    // ✅ 찜 여부 확인 (프론트에서 찜 상태 체크용)
    public boolean isBookWished(String userid, Long bookId) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("책 없음"));

        return wishlistRepository.existsByUserAndBook(user, book);
    }
}

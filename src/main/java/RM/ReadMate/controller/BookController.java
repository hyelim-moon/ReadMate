package RM.ReadMate.controller;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {

    private final BookService bookService;

    // ✅ 책 저장 - 로그인한 사용자만 가능
    @PostMapping
    public ResponseEntity<BookDto> saveBook(@RequestBody Book book) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userid = auth.getName();
        Book saved = bookService.save(book, userid);
        return ResponseEntity.ok(bookService.convertToDto(saved));
    }

    // ✅ 전체 책 목록 (Book → BookDto 변환)
    @GetMapping
    public ResponseEntity<List<BookDto>> getAllBooks() {
        return ResponseEntity.ok(
                bookService.findAll().stream()
                        .map(bookService::convertToDto)
                        .toList()
        );
    }

    // ✅ 장르별 책 목록 (Book → BookDto 변환)
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<BookDto>> getBooksByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(
                bookService.findByGenre(genre).stream()
                        .map(bookService::convertToDto)
                        .toList()
        );
    }

    // ✅ ISBN으로 조회 (Book → BookDto 변환)
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<BookDto> getBookByIsbn(@PathVariable String isbn) {
        return bookService.findByIsbn(isbn)
                .map(bookService::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 베스트셀러 (이미 BookDto 반환)
    @GetMapping("/bestseller")
    public ResponseEntity<List<BookDto>> getBestsellerBooks(
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return ResponseEntity.ok(bookService.fetchBestsellers(limit));
    }

    // ✅ 신간 베스트 (이미 BookDto 반환)
    @GetMapping("/newbest")
    public ResponseEntity<List<BookDto>> getNewBestBooks(
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return ResponseEntity.ok(bookService.fetchNewBest(limit));
    }

    // ✅ ID로 조회 (Book → BookDto 변환)
    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        Optional<Book> found = bookService.findById(id);
        return found
                .map(bookService::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
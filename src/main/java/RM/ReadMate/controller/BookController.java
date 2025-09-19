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
    public ResponseEntity<Book> saveBook(@RequestBody Book book) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userid = auth.getName(); // JWT에서 추출한 사용자 ID
        return ResponseEntity.ok(bookService.save(book, userid));
    }

    // ✅ 전체 책 목록
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.findAll());
    }

    // ✅ ISBN으로 조회 (DB 기준)
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        return bookService.findByIsbn(isbn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 에디터 추천 (알라딘 ItemEditorChoice → GoogleBooks 보강 → DB upsert)
    //    예: GET /api/books/picks?limit=20
    @GetMapping("/picks")
    public ResponseEntity<List<BookDto>> getEditorPicks(
            @RequestParam(name = "categoryId") Integer categoryId,
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return ResponseEntity.ok(bookService.fetchEditorPicksByCategory(categoryId, limit));
    }

    // ✅ 베스트셀러 (알라딘 Bestseller → GoogleBooks 보강 → DB upsert)
    //    예: GET /api/books/bestseller?limit=20
    @GetMapping("/bestseller")
    public ResponseEntity<List<BookDto>> getBestsellerBooks(
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return ResponseEntity.ok(bookService.fetchBestsellers(limit));
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

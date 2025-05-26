package RM.ReadMate.controller;

import RM.ReadMate.entity.Book;
import RM.ReadMate.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // 프론트엔드 연동을 위한 CORS 설정
public class BookController {

    private final BookService bookService;

    @PostMapping
    public ResponseEntity<Book> saveBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.save(book));
    }

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.findAll());
    }

    @GetMapping("/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        return bookService.findByIsbn(isbn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ 베스트셀러용 슬라이드 API (상위 5개 임의 반환)
    @GetMapping("/bestseller")
    public ResponseEntity<List<Book>> getBestsellerBooks() {
        List<Book> books = bookService.findAll();
        int count = Math.min(10, books.size());
        return ResponseEntity.ok(books.subList(0, count));
    }

    // ✅ 에디터 추천용 슬라이드 API (하위 5개 임의 반환)
    @GetMapping("/picks")
    public ResponseEntity<List<Book>> getEditorPicks() {
        List<Book> books = bookService.findAll();
        int size = books.size();
        int fromIndex = Math.max(0, size - 10);
        return ResponseEntity.ok(books.subList(fromIndex, size));
    }
}

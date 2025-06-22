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
import java.util.Objects;
import java.util.stream.Collectors;

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

    // ✅ ISBN으로 조회
    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<Book> getBookByIsbn(@PathVariable String isbn) {
        return bookService.findByIsbn(isbn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 에디터 추천 API
    @GetMapping("/picks")
    public ResponseEntity<List<BookDto>> getEditorPicks() {
        List<String> titles = List.of(
                "불편한 편의점", "역행자", "세이노의 가르침", "아몬드", "파과",
                "안녕이라 그랬어", "첫 여름, 완주",
                "어른의 행복은 조용하다", "모순", "완벽한 공부법"
        );

        List<BookDto> result = titles.stream()
                .map(bookService::fetchBookFromApis)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ✅ 베스트셀러 추천 API
    @GetMapping("/bestseller")
    public ResponseEntity<List<BookDto>> getBestsellerBooks() {
        List<String> titles = List.of(
                "단 한 번의 삶", "듀얼 브레인", "작은 땅의 야수들", "소년이 온다",
                "여학교의 별 4", "빛과 실",
                "초역 부처의 말", "작별하지 않는다", "스토너", "급류"
        );

        List<BookDto> result = titles.stream()
                .map(bookService::fetchBookFromApis)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ✅ ID로 조회 (⚠ 반드시 마지막에 배치)
    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        return bookService.findById(id)
                .map(book -> ResponseEntity.ok(bookService.convertToDto(book)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

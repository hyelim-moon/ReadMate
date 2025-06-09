package RM.ReadMate.controller;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
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

    // ✅ 에디터 추천용 슬라이드 API (하위 5개 임의 반환)
    @GetMapping("/picks")
    public ResponseEntity<List<BookDto>> getEditorPicks() {
        List<String> titles = List.of(
                "불편한 편의점",
                "역행자",
                "세이노의 가르침",
                "아몬드",
                "파과",
                "죽고 싶지만 떡볶이는 먹고 싶어",
                "나는 나로 살기로 했다",
                "우리는 달빛에도 걸을 수 있다",
                "모순",
                "완벽한 공부법"
        );

        List<BookDto> result = titles.stream()
                .map(bookService::fetchBookFromApis)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ✅ 베스트셀러용 슬라이드 API (상위 5개 임의 반환)
    @GetMapping("/bestseller")
    public ResponseEntity<List<BookDto>> getBestsellerBooks() {
        List<String> titles = List.of(
                "단 한 번의 삶",
                "듀얼 브레인",
                "모순",
                "소년이 온다",
                "여학교의 별 4",
                "제16회 젊은작가상 수상작품집",
                "초역 부처의 말",
                "작별하지 않는다",
                "스토너",
                "급류"
        );

        List<BookDto> result = titles.stream()
                .map(bookService::fetchBookFromApis)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
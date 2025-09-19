package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private final AladinService aladinService;
    private final GoogleBooksService googleBooksService;

    /* =========================
       기본 CRUD
       ========================= */

    @Transactional
    public Book save(Book book, String userid) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("등록자 정보를 찾을 수 없습니다."));
        book.setUser(user);
        return bookRepository.save(book);
    }

    @Transactional(readOnly = true)
    public List<Book> findAll() { return bookRepository.findAll(); }

    @Transactional(readOnly = true)
    public Optional<Book> findByIsbn(String isbn) { return bookRepository.findByIsbn(isbn); }

    @Transactional(readOnly = true)
    public Optional<Book> findById(Long id) { return bookRepository.findById(id); }

    @Transactional
    public void deleteById(Long id) { bookRepository.deleteById(id); }

    public BookDto convertToDto(Book book) { return new BookDto(book); }

    /* =========================
       외부 API 수집
       ========================= */

    /** 베스트셀러 → 보강/업서트 */
    @Transactional
    public List<BookDto> fetchBestsellers(Integer limit) {
        var aladinList = aladinService.getBestsellers(limit == null ? 20 : limit);
        return aladinList.stream()
                .map(this::upsertFromAladin)
                .filter(b -> b != null)          // ISBN 없는 항목 등 안전 필터
                .map(BookDto::new)
                .toList();
    }

    /** 에디터 추천(카테고리 미지정 호출; 가능하면 아래 카테고리 버전 사용 권장) → 보강/업서트 */
    @Transactional
    public List<BookDto> fetchEditorPicks(Integer limit) {
        var aladinList = aladinService.getEditorPicks(limit == null ? 20 : limit);
        return aladinList.stream()
                .map(this::upsertFromAladin)
                .filter(b -> b != null)
                .map(BookDto::new)
                .toList();
    }

    /** ✅ 에디터 추천(카테고리 지정) → 보강/업서트 */
    @Transactional
    public List<BookDto> fetchEditorPicksByCategory(Integer categoryId, Integer limit) {
        if (categoryId == null || categoryId <= 0) {
            // 카테고리가 필수인 호출이면 빈 리스트 반환(또는 IllegalArgumentException 던져도 됨)
            return List.of();
        }
        var aladinList = aladinService.getEditorPicksByCategory(categoryId, limit == null ? 20 : limit);
        return aladinList.stream()
                .map(this::upsertFromAladin)
                .filter(b -> b != null)
                .map(BookDto::new)
                .toList();
    }

    /** 알라딘 1권 → (구글 보강 후) DB 업서트, Book 반환 */
    @Transactional
    private Book upsertFromAladin(AladinService.AladinBook a) {
        if (a == null || a.isbn13() == null || a.isbn13().isBlank()) {
            // ISBN 없으면 스킵
            return null;
        }

        Optional<Book> exist = bookRepository.findByIsbn(a.isbn13());
        if (exist.isPresent()) return exist.get();

        // 구글북스로 보강 (ISBN 우선)
        BookDto enriched = googleBooksService.enrichByIsbn(a.isbn13());

        String mergedIsbn = firstNonEmpty(enriched != null ? enriched.getIsbn() : null, a.isbn13(), "");
        if (mergedIsbn.isBlank()) return null; // 안전 가드

        // 썸네일(https 정규화)
        String mergedImage = firstNonEmpty(
                enriched != null ? enriched.getBookImage() : null,
                a.coverUrl(), ""
        );
        if (!mergedImage.isBlank()) {
            mergedImage = mergedImage.replaceFirst("^http://", "https://");
        }

        Book book = Book.builder()
                .isbn(mergedIsbn)
                .bookName(firstNonEmpty(enriched != null ? enriched.getBookName() : null, a.title(), ""))
                .author(firstNonEmpty(enriched != null ? enriched.getAuthor() : null, a.author(), ""))
                .publisher(firstNonEmpty(enriched != null ? enriched.getPublisher() : null, a.publisher(), ""))
                .genre(enriched != null ? enriched.getGenre() : null)
                .content(firstNonEmpty(enriched != null ? enriched.getContent() : null, a.description(), ""))
                .bookImage(mergedImage)
                .pageCount(enriched != null ? enriched.getPageCount() : Math.max(a.pageCount(), 0))
                .build();

        return bookRepository.save(book);
    }

    /** 기존 제목 단건 수집 (유지) */
    @Transactional
    public BookDto fetchBookFromApis(String title) {
        if (title == null || title.isBlank()) return null;

        // 같은 제목이 여러 개여도 최근 1개만 사용
        var existingByTitle = bookRepository.findFirstByBookNameOrderByIdDesc(title);
        if (existingByTitle.isPresent()) {
            return new BookDto(existingByTitle.get());
        }

        BookDto dto = googleBooksService.searchByTitle(title);
        if (dto == null) return null;

        if (dto.getIsbn() != null && !dto.getIsbn().isBlank()) {
            var existingByIsbn = bookRepository.findByIsbn(dto.getIsbn());
            if (existingByIsbn.isPresent()) return new BookDto(existingByIsbn.get());
        }

        // 썸네일(https 정규화)
        String img = safe(dto.getBookImage());
        if (!img.isBlank()) {
            img = img.replaceFirst("^http://", "https://");
        }

        Book entity = Book.builder()
                .isbn(safe(dto.getIsbn()))
                .bookName(firstNonEmpty(dto.getBookName(), title))
                .author(safe(dto.getAuthor()))
                .publisher(safe(dto.getPublisher()))
                .genre(dto.getGenre())
                .content(safe(dto.getContent()))
                .bookImage(img)
                .pageCount(dto.getPageCount())
                .build();

        bookRepository.save(entity);
        return new BookDto(entity);
    }

    /** (선택) 여러 제목 배치 수집 — 현재 쓰지 않으면 제거해도 무방 */
    @Transactional
    public List<BookDto> fetchBooksFromTitles(List<String> titles) {
        if (titles == null || titles.isEmpty()) return List.of();
        var out = new java.util.ArrayList<BookDto>(titles.size());
        for (String t : titles) {
            if (t == null || t.isBlank()) continue;
            BookDto dto = fetchBookFromApis(t);
            if (dto != null) out.add(dto);
        }
        return out;
    }

    /* =========================
       유틸
       ========================= */

    private String safe(String s) { return (s == null ? "" : s); }

    private String firstNonEmpty(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }
}

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
    public List<Book> findByGenre(String genre) { return bookRepository.findByGenre(genre); }

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
                .filter(b -> b != null)
                .map(BookDto::new)
                .toList();
    }

    /** ✅ 신간 베스트 → 보강/업서트 */
    @Transactional
    public List<BookDto> fetchNewBest(Integer limit) {
        var aladinList = aladinService.getNewBest(limit == null ? 20 : limit);
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
            return null;
        }

        Optional<Book> exist = bookRepository.findByIsbn(a.isbn13());
        if (exist.isPresent()) return exist.get();

        BookDto enriched = googleBooksService.enrichByIsbn(a.isbn13());

        String mergedIsbn = firstNonEmpty(enriched != null ? enriched.getIsbn() : null, a.isbn13(), "");
        if (mergedIsbn.isBlank()) return null;

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

    /* =========================
       유틸
       ========================= */

    private String safe(String s) { return (s == null ? "" : s); }

    private String firstNonEmpty(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }
}

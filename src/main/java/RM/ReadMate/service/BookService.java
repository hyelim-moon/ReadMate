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

        // ✅ 수동 입력 시에도 이미지 고해상도 보정
        if (!isBlank(book.getBookImage())) {
            book.setBookImage(ensureHighRes(book.getBookImage()));
        }

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

    /** 신간 베스트 → 보강/업서트 */
    @Transactional
    public List<BookDto> fetchNewBest(Integer limit) {
        var aladinList = aladinService.getNewBest(limit == null ? 20 : limit);
        return aladinList.stream()
                .map(this::upsertFromAladin)
                .filter(b -> b != null)
                .map(BookDto::new)
                .toList();
    }

    /**
     * 알라딘 1권 → (구글 보강 후) DB 업서트, Book 반환
     * - 이미지 우선순위: Google(zoom=5) → Aladin cover500 → Aladin coverLarge → Aladin cover
     * - 이미 존재하면 부족한 필드 보강 업데이트
     */
    private Book upsertFromAladin(AladinService.AladinBook a) {
        if (a == null || a.isbn13() == null || a.isbn13().isBlank()) {
            return null;
        }

        // 1) 구글북스로 보강
        BookDto enriched = googleBooksService.enrichByIsbn(a.isbn13());

        // 2) 최종 ISBN
        String mergedIsbn = firstNonEmpty(
                enriched != null ? enriched.getIsbn() : null,
                a.isbn13(), ""
        );
        if (mergedIsbn.isBlank()) return null;

        // 3) 이미지 후보 생성 (각 후보를 즉시 ensureHighRes로 보정)
        String candidateGoogle = ensureHighRes(enriched != null ? enriched.getBookImage() : null);
        String candidateA500   = ensureHighRes(a.cover500Url());           // ✅ 최우선 알라딘 500
        String candidateALarge = ensureHighRes(a.coverLargeUrl());
        String candidateADef   = ensureHighRes(a.coverUrl());

        String mergedImage = ensureHighRes(
                firstNonEmpty(candidateGoogle, candidateA500, candidateALarge, candidateADef)
        );

        // 4) 이미 존재하는 경우 → 보강 업데이트
        Optional<Book> existOpt = bookRepository.findByIsbn(mergedIsbn);
        if (existOpt.isPresent()) {
            Book exist = existOpt.get();

            if (isBlank(exist.getBookName())) {
                exist.setBookName(firstNonEmpty(
                        enriched != null ? enriched.getBookName() : null,
                        a.title(), exist.getBookName()
                ));
            }
            if (isBlank(exist.getAuthor())) {
                exist.setAuthor(firstNonEmpty(
                        enriched != null ? enriched.getAuthor() : null,
                        a.author(), exist.getAuthor()
                ));
            }
            if (isBlank(exist.getPublisher())) {
                exist.setPublisher(firstNonEmpty(
                        enriched != null ? enriched.getPublisher() : null,
                        a.publisher(), exist.getPublisher()
                ));
            }
            if (isBlank(exist.getGenre()) && enriched != null && !isBlank(enriched.getGenre())) {
                exist.setGenre(enriched.getGenre());
            }
            if (isBlank(exist.getContent())) {
                exist.setContent(firstNonEmpty(
                        enriched != null ? enriched.getContent() : null,
                        a.description(), exist.getContent()
                ));
            }
            if (exist.getPageCount() <= 0) {
                int page = enriched != null ? enriched.getPageCount() : Math.max(a.pageCount(), 0);
                if (page > 0) exist.setPageCount(page);
            }

            if (!isBlank(mergedImage)) {
                exist.setBookImage(ensureHighRes(mergedImage)); // ✅ 항상 보정
            }

            return bookRepository.save(exist);
        }

        // 5) 신규 저장
        Book book = Book.builder()
                .isbn(mergedIsbn)
                .bookName(firstNonEmpty(
                        enriched != null ? enriched.getBookName() : null,
                        a.title(), ""
                ))
                .author(firstNonEmpty(
                        enriched != null ? enriched.getAuthor() : null,
                        a.author(), ""
                ))
                .publisher(firstNonEmpty(
                        enriched != null ? enriched.getPublisher() : null,
                        a.publisher(), ""
                ))
                .genre(enriched != null ? enriched.getGenre() : null)
                .content(firstNonEmpty(
                        enriched != null ? enriched.getContent() : null,
                        a.description(), ""
                ))
                .bookImage(ensureHighRes(mergedImage)) // ✅ 항상 보정
                .pageCount(enriched != null ? enriched.getPageCount() : Math.max(a.pageCount(), 0))
                .build();

        return bookRepository.save(book);
    }

    /* =========================
       유틸
       ========================= */

    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    private String firstNonEmpty(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }

    /**
     * ✅ 단일 통합 보정기
     * - http → https
     * - Google Books content: zoom=5로 승격
     * - 알라딘: /coversum/, /cover/ → /cover500/로 승격
     */
    private String ensureHighRes(String url) {
        if (url == null || url.isBlank()) return "";
        String u = url.trim();

        // http -> https
        if (u.startsWith("http://")) {
            u = "https://" + u.substring("http://".length());
        }

        // Google Books content: zoom=5
        if (u.contains("books.google.com/books/content")) {
            if (u.contains("zoom=")) {
                u = u.replaceAll("zoom=\\d+", "zoom=5");
            } else {
                u = u + (u.contains("?") ? "&" : "?") + "zoom=5";
            }
        }

        // Aladin: cover500로 승격
        if (u.contains("image.aladin.co.kr")) {
            u = u.replace("/coversum/", "/cover500/")
                    .replace("/cover/", "/cover500/");
        }

        return u;
    }
}
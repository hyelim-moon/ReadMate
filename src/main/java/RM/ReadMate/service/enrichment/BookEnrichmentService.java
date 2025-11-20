package RM.ReadMate.service.enrichment;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.service.AladinService;
import RM.ReadMate.service.GenreMapper;
import RM.ReadMate.service.GoogleBooksService;
import RM.ReadMate.service.HeuristicGenreClassifier;
import RM.ReadMate.service.TitleNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import RM.ReadMate.service.NovelSubgenreClassifier;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookEnrichmentService {

    private final BookRepository bookRepository;
    private final GoogleBooksService googleBooksService;
    private final AladinService aladinService;

    /**
     * genre / content / pageCount 중 하나라도 비어 있는 책들을
     * Google Books + Aladin API 로 가능한 만큼 채워 넣는다.
     * +
     * 영어로 들어가 있는 장르는 GenreMapper 를 이용해서 한국어로 정규화한다.
     */
    @Transactional
    public int enrichMissing(Integer batchSize) {
        // 책이 500권 정도라서 전체를 스캔해도 부담이 거의 없음
        List<Book> targets = bookRepository.findAll();

        if (batchSize != null && batchSize > 0 && batchSize < targets.size()) {
            targets = targets.subList(0, batchSize);
        }

        int updatedCount = 0;
        for (Book book : targets) {
            if (enrichOne(book)) {
                updatedCount++;
            }
        }
        return updatedCount;
    }

    /**
     * 한 권에 대한 실제 백필 + 정규화 로직
     */
    private boolean enrichOne(Book book) {

        String rawIsbn = safe(book.getIsbn());
        String cleanIsbn = TitleNormalizer.cleanIsbn(rawIsbn);

        BookDto google = null;
        AladinService.AladinBook aladin = null;

        /* ========= 1차: ISBN 기반 조회 ========= */

        if (!cleanIsbn.isBlank()) {
            google = googleBooksService.enrichByIsbn(cleanIsbn);
            aladin = aladinService.lookupByIsbn(cleanIsbn);
        }

        /* ========= 2차: 제목 기반 조회 ========= */

        if (google == null) {
            String title = TitleNormalizer.cleanTitle(book.getBookName());
            if (!title.isBlank()) {
                google = googleBooksService.searchByTitle(title);
            }
        }

        if (aladin == null) {
            String title = TitleNormalizer.cleanTitle(book.getBookName());
            if (!title.isBlank()) {
                aladin = aladinService.searchBestByTitle(
                        title,
                        book.getAuthor(),
                        book.getPublisher()
                );
            }
        }

        boolean changed = false;

        /* ========= 장르(genre) – 영어 → 한국어 정규화 포함 ========= */

        if (needsGenreNormalize(book.getGenre())) {

            String currentGenre = safe(book.getGenre());

            // 1) Google / Aladin 카테고리 → 한국어 매핑
            String mappedFromGoogle = null;
            if (google != null && !isBlank(google.getGenre())) {
                mappedFromGoogle = GenreMapper.mapFromGoogle(google.getGenre());
            }

            // Aladin 쪽 categoryName 을 record 에 넣지 않았으니, 일단 생략 (필요하면 확장)
            String mappedFromAladin = null;

            // 2) 이미 DB 에 들어있는 영어 장르도 한 번 더 매핑 시도
            String mappedFromCurrent = GenreMapper.mapFromGoogle(currentGenre);
            if (isBlank(mappedFromCurrent)) {
                mappedFromCurrent = GenreMapper.mapFromAladin(currentGenre);
            }

            // 3) 우선순위: 현재값 매핑 → Google → Aladin
            String genre = firstNonBlank(mappedFromCurrent,
                    mappedFromGoogle,
                    mappedFromAladin);

            // 4) 그래도 비어 있으면 내용/출판사/저자를 기반으로 휴리스틱 추정
            if (genre.isBlank()) {
                String mergedContent = firstNonBlank(
                        book.getContent(),
                        google != null ? google.getContent() : null,
                        aladin != null ? aladin.description() : null
                );
                String mergedPublisher = firstNonBlank(
                        book.getPublisher(),
                        google != null ? google.getPublisher() : null,
                        aladin != null ? aladin.publisher() : null
                );
                String mergedAuthor = firstNonBlank(
                        book.getAuthor(),
                        google != null ? google.getAuthor() : null,
                        aladin != null ? aladin.author() : null
                );

                genre = safe(HeuristicGenreClassifier.guess(
                        book.getBookName(),
                        mergedContent,
                        mergedPublisher,
                        mergedAuthor
                ));
            }

            // 5) 그래도 없으면 "기타" 로 강제
            if (genre.isBlank()) {
                genre = "기타";
            }

            if (!genre.equals(book.getGenre())) {
                book.setGenre(genre);
                changed = true;
            }

            // 추가: '소설' 장르를 세부 분류 (고전 소설/영미소설/한국소설/소설)
            if ("소설".equals(genre)) {
                String sub = NovelSubgenreClassifier.classify(book);
                if (sub != null && !sub.isBlank()) {
                    genre = sub;
                }
            }
        }

        /* ========= 내용(content) ========= */
        if (isBlank(book.getContent())) {
            String summary = firstNonBlank(
                    google != null ? google.getContent() : null,
                    aladin != null ? aladin.description() : null
            );

            // 두 API 모두 내용이 없으면 기본 안내 문구
            if (summary.isBlank()) {
                summary = "이 도서는 현재 상세 소개가 제공되지 않습니다.";
            }

            book.setContent(summary);
            changed = true;
        }

        /* ========= 페이지 수(pageCount) ========= */
        if (book.getPageCount() <= 0) {
            int pages = 0;

            if (google != null && google.getPageCount() > 0) {
                pages = google.getPageCount();
            } else if (aladin != null && aladin.pageCount() > 0) {
                pages = aladin.pageCount();
            }

            if (pages <= 0) {
                pages = 1; // 최소 1페이지
            }

            if (book.getPageCount() != pages) {
                book.setPageCount(pages);
                changed = true;
            }
        }

        /* ========= 저자(author) ========= */
        if (isBlank(book.getAuthor())) {
            String author = firstNonBlank(
                    google != null ? google.getAuthor() : null,
                    aladin != null ? aladin.author() : null
            );
            if (!author.isBlank()) {
                book.setAuthor(author);
                changed = true;
            }
        }

        /* ========= 출판사(publisher) ========= */
        if (isBlank(book.getPublisher())) {
            String publisher = firstNonBlank(
                    google != null ? google.getPublisher() : null,
                    aladin != null ? aladin.publisher() : null
            );
            if (!publisher.isBlank()) {
                book.setPublisher(publisher);
                changed = true;
            }
        }

        /* ========= 표지 이미지(book_image) ========= */
        if (isBlank(book.getBookImage())) {
            String googleImg = google != null ? google.getBookImage() : null;

            String aladinImg = null;
            if (aladin != null) {
                aladinImg = firstNonBlank(
                        aladin.cover500Url(),
                        aladin.coverLargeUrl(),
                        aladin.coverUrl(),
                        aladin.coverSmallUrl()
                );
            }

            String finalUrl = ensureHighRes(firstNonBlank(googleImg, aladinImg));
            if (!isBlank(finalUrl)) {
                book.setBookImage(finalUrl);
                changed = true;
            }
        }

        return changed;
    }

    /* ===== 유틸 메서드들 ===== */

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    /** 여러 후보 중 처음으로 빈 문자열이 아닌 값 반환 */
    private String firstNonBlank(String... values) {
        if (values == null) return "";
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    /**
     * 지금 장르가 "정상화가 필요한 상태" 인지 판단:
     *  - NULL / 빈 문자열 / "미분류"
     *  - 영어 알파벳이 하나라도 포함된 경우 (Self-Help, Computers 등)
     */
    private boolean needsGenreNormalize(String genre) {
        if (genre == null) return true;
        if (genre.isBlank()) return true;
        if ("미분류".equals(genre)) return true;

        for (char ch : genre.toCharArray()) {
            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Google / Aladin 이미지 공통 후처리
     *  - http → https
     *  - Google Books content 이미지: zoom=5 강제
     *  - 알라딘: /coversum/, /cover/ → /cover500/
     */
    private String ensureHighRes(String url) {
        if (url == null || url.isBlank()) return url;
        String u = url.trim();

        if (u.startsWith("http://")) {
            u = "https://" + u.substring("http://".length());
        }

        if (u.contains("books.google.com/books/content")) {
            if (u.contains("zoom=")) {
                u = u.replaceAll("zoom=\\d+", "zoom=5");
            } else {
                u = u + (u.contains("?") ? "&" : "?") + "zoom=5";
            }
        }

        if (u.contains("image.aladin.co.kr")) {
            u = u.replace("/coversum/", "/cover500/")
                    .replace("/cover/", "/cover500/");
        }

        return u;
    }
}

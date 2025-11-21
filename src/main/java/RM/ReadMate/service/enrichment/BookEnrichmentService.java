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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookEnrichmentService {

    private final BookRepository bookRepository;
    private final GoogleBooksService googleBooksService;
    private final AladinService aladinService;

    /** genre / content / pageCount 중 하나라도 비어있는 책들을 보강 */
    @Transactional
    public int enrichMissing(Integer batchSize) {
        List<Book> targets = bookRepository.findNeedEnrichmentAll();
        if (targets.isEmpty()) return 0;

        if (batchSize != null && batchSize > 0 && batchSize < targets.size()) {
            targets = new ArrayList<>(targets.subList(0, batchSize));
        }

        int updated = 0;
        for (Book book : targets) {
            boolean changed = enrichOne(book);
            if (changed) {
                bookRepository.save(book);
                updated++;
            }
        }
        return updated;
    }

    /** 단일 Book 보강 */
    private boolean enrichOne(Book book) {
        boolean changed = false;

        final String cleanIsbn = TitleNormalizer.cleanIsbn(book.getIsbn());
        final String queryTitle = TitleNormalizer.cleanTitle(book.getBookName());

        BookDto google = null;
        AladinService.AladinBook aladin = null;

        // 1) ISBN 우선
        if (!isBlank(cleanIsbn)) {
            google = googleBooksService.enrichByIsbn(cleanIsbn);
            aladin = aladinService.lookupByIsbn(cleanIsbn);
        }
        // 2) 제목 기반
        if (google == null && !isBlank(queryTitle)) {
            google = googleBooksService.searchByTitle(queryTitle);
        }
        if (aladin == null && !isBlank(queryTitle)) {
            aladin = aladinService.searchBestByTitle(
                    queryTitle,
                    safe(book.getAuthor()),
                    safe(book.getPublisher())
            );
        }

        /* ===== 장르 보강 =====
           원칙: "원래 책의 장르 텍스트"를 최우선으로 살려 넣고, 매핑 성공 시 표준 장르로 치환.
           그래도 불가하면 휴리스틱 → 마지막에만 '기타'.
         */
        if (shouldFillGenre(book.getGenre())) {
            final String current = safe(book.getGenre());
            final String rawFromGoogle = (google != null) ? safe(google.getGenre()) : "";
            final String rawFromAladin = (aladin != null) ? safe(aladin.categoryName()) : "";

            // 1) 표준 매핑 (알라딘 → 구글 순)
            String mappedFromAladin = GenreMapper.mapFromAladin(rawFromAladin);
            String mappedFromGoogle = GenreMapper.mapFromGoogle(rawFromGoogle);
            String mappedFromCurrent = firstNonBlank(
                    GenreMapper.mapFromAladin(current),
                    GenreMapper.mapFromGoogle(current)
            );

            String genre = firstNonBlank(mappedFromCurrent, mappedFromAladin, mappedFromGoogle);

            // 2) 매핑 실패 → 원본 대분류 텍스트 그대로
            if (isBlank(genre)) {
                String rawOriginal = firstNonBlank(rawFromAladin, rawFromGoogle, current);
                if (!isBlank(rawOriginal)) {
                    genre = simplifyOriginalCategory(rawOriginal);
                }
            }

            // 3) 그래도 실패 → 휴리스틱
            if (isBlank(genre)) {
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
                        book.getBookName(), mergedContent, mergedPublisher, mergedAuthor
                ));
            }

            // 4) 최종 안전장치
            if (isBlank(genre)) genre = "기타";

            if (!Objects.equals(genre, book.getGenre())) {
                book.setGenre(genre);
                changed = true;
            }
        }

        /* ===== 내용 ===== */
        if (isBlank(book.getContent())) {
            String summary = firstNonBlank(
                    book.getContent(),
                    google != null ? google.getContent() : null,
                    aladin != null ? aladin.description() : null
            );
            if (isBlank(summary)) summary = "이 도서는 현재 상세 소개가 제공되지 않습니다.";
            book.setContent(summary);
            changed = true;
        }

        /* ===== 페이지수 ===== */
        if (book.getPageCount() <= 0) {
            int pages = 0;
            if (google != null && google.getPageCount() > 0) pages = google.getPageCount();
            else if (aladin != null && aladin.pageCount() > 0) pages = aladin.pageCount();
            if (pages > 0) { book.setPageCount(pages); changed = true; }
        }

        /* ===== 표지 ===== */
        if (isBlank(book.getBookImage())) {
            String u = firstNonBlank(
                    google != null ? google.getBookImage() : null,
                    aladin != null ? aladin.coverLargeUrl() : null,
                    aladin != null ? aladin.coverUrl() : null,
                    aladin != null ? aladin.coverSmallUrl() : null
            );
            if (!isBlank(u)) { book.setBookImage(upsizeCoverIfPossible(u)); changed = true; }
        }

        return changed;
    }

    /* ========== helpers ========== */

    private boolean shouldFillGenre(String genre) {
        if (genre == null) return true;
        final String g = genre.trim();
        if (g.isEmpty()) return true;
        if ("미분류".equals(g)) return true;
        if ("기타".equals(g)) return true; // ✅ '기타'도 재보정 대상
        // 영어 알파벳 포함 장르도 보정 대상으로 간주
        for (char ch : g.toCharArray()) {
            if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) return true;
        }
        return false;
    }

    private String simplifyOriginalCategory(String raw) {
        String s = safe(raw);
        s = s.replace("\\u003e", ">");
        String[] parts = s.split("\\s*>\\s*|\\s*/\\s*|\\s*\\|\\s*|\\s*>\\s*");
        if (parts.length > 0) return parts[0].trim();
        return s;
    }

    private String safe(String s) { return s == null ? "" : s.trim(); }
    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }

    private String firstNonBlank(String... arr) {
        if (arr == null) return "";
        for (String s : arr) if (!isBlank(s)) return s.trim();
        return "";
    }

    private String upsizeCoverIfPossible(String url) {
        if (isBlank(url)) return url;
        String u = url.trim();
        if (u.contains("books.google.com/books/content")) {
            if (u.contains("zoom=")) u = u.replaceAll("zoom=\\d+", "zoom=5");
            else u = u + (u.contains("?") ? "&" : "?") + "zoom=5";
            if (u.startsWith("http://")) u = u.replaceFirst("^http://", "https://");
        }
        if (u.contains("image.aladin.co.kr")) {
            u = u.replace("/coversum/", "/cover500/").replace("/cover/", "/cover500/");
        }
        return u;
    }
}

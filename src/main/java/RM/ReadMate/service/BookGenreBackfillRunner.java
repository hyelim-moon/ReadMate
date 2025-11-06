package RM.ReadMate.service;

import RM.ReadMate.entity.Book;
import RM.ReadMate.repository.BookRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookGenreBackfillRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(BookGenreBackfillRunner.class);

    private final BookRepository bookRepository;
    private final RestTemplate http = new RestTemplate();
    private final ObjectMapper om = new ObjectMapper();

    @Value("${backfill.genre.enabled:false}") private boolean enabled;
    @Value("${backfill.genre.limit:-1}") private int limitTotal;               // -1: 전체
    @Value("${backfill.genre.batch-size:150}") private int batchSize;
    @Value("${backfill.genre.throttle-ms:250}") private long throttleMs;
    @Value("${backfill.genre.use-heuristics:true}") private boolean useHeuristics;

    @Value("${aladin.ttb-key:}") private String aladinKey;
    @Value("${google.books.api-key:}") private String googleKey;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("[GenreBackfill] disabled → 실행 안 함");
            return;
        }
        log.info("[GenreBackfill] 시작 (limitTotal={}, batchSize={}, throttle={}ms, heuristics={})",
                limitTotal, batchSize, throttleMs, useHeuristics);

        int processed = 0, updated = 0;

        while (true) {
            int remain = (limitTotal < 0) ? batchSize : Math.min(batchSize, Math.max(0, limitTotal - processed));
            if (remain == 0) break;

            List<Book> batch = bookRepository.findUnclassified(PageRequest.of(0, remain));
            if (batch.isEmpty()) break;

            for (Book b : batch) {
                String before = safe(b.getGenre());
                String chosen = resolveGenre(b);

                if (!StringUtils.hasText(chosen) && useHeuristics) {
                    // 최후의 보루: 키워드 휴리스틱
                    String t = TitleNormalizer.cleanTitle(b.getBookName());
                    String a = TitleNormalizer.primaryAuthor(b.getAuthor());
                    chosen = HeuristicGenreClassifier.guess(t, b.getContent(), b.getPublisher(), a);
                }

                if (StringUtils.hasText(chosen) && !chosen.equals(before)) {
                    b.setGenre(chosen);
                    updated++;
                    log.info("  • [{}] {} :: {} → {}", b.getId(), safe(b.getBookName()), before, chosen);
                } else {
                    log.info("  • [{}] {} :: 유지 (A/G/휴리스틱 불가 또는 동일)", b.getId(), safe(b.getBookName()));
                }

                processed++;
                if (throttleMs > 0) try { Thread.sleep(throttleMs); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
            }

            if (limitTotal > 0 && processed >= limitTotal) break;
        }

        log.info("[GenreBackfill] 완료: {}건 처리 / {}건 업데이트", processed, updated);
        log.info("[GenreBackfill] 재실행 방지: backfill.genre.enabled=false 권장");
    }

    // ─────────────────────────────────────────────

    /** 1차(ISBN) → 2차(정규화제목+저자) → 3차(제목만) */
    private String resolveGenre(Book b) {
        // 알라딘 ISBN
        String aladin = lookupAladinByIsbn(b);
        String google = lookupGoogleByIsbn(b);
        String chosen = GenreMapper.chooseBest(aladin, google);
        if (StringUtils.hasText(chosen)) return chosen;

        // 제목/저자 정규화 후 정확검색
        String title = TitleNormalizer.cleanTitle(b.getBookName());
        String author = TitleNormalizer.primaryAuthor(b.getAuthor());

        aladin = searchAladinByTitle(title);
        google = searchGoogleByTitleAuthor(title, author);
        chosen = GenreMapper.chooseBest(aladin, google);
        if (StringUtils.hasText(chosen)) return chosen;

        // 제목만
        google = searchGoogleByTitleOnly(title);
        return GenreMapper.chooseBest(aladin, google);
    }

    // ────────── 알라딘 ──────────
    private String lookupAladinByIsbn(Book b) {
        try {
            if (!StringUtils.hasText(aladinKey)) return null;
            String isbn = TitleNormalizer.cleanIsbn(b.getIsbn());
            if (isbn.isBlank()) return null;
            String idType = (isbn.length() >= 13) ? "ISBN13" : "ISBN";
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx")
                    .queryParam("TTBKey", aladinKey)
                    .queryParam("itemIdType", idType)
                    .queryParam("ItemId", isbn)
                    .queryParam("output", "js")
                    .queryParam("Version", "20131101")
                    .toUriString();
            String body = http.getForObject(url, String.class);
            String cat = parseAladinCategory(body);
            return GenreMapper.mapFromAladin(cat);
        } catch (Exception ignore) { return null; }
    }

    private String searchAladinByTitle(String title) {
        try {
            if (!StringUtils.hasText(aladinKey) || title.isBlank()) return null;
            String q = URLEncoder.encode(title, StandardCharsets.UTF_8);
            String url = "https://www.aladin.co.kr/ttb/api/ItemSearch.aspx"
                    + "?TTBKey=" + aladinKey
                    + "&Query=" + q
                    + "&QueryType=Title&MaxResults=5&SearchTarget=Book&output=js&Version=20131101";
            String body = http.getForObject(url, String.class);
            String cat = parseAladinCategory(body);
            return GenreMapper.mapFromAladin(cat);
        } catch (Exception ignore) { return null; }
    }

    private String parseAladinCategory(String json) {
        if (!StringUtils.hasText(json)) return null;
        try {
            JsonNode root = om.readTree(json);
            JsonNode items = root.path("item");
            if (items.isArray() && items.size() > 0) {
                // 더 정확하게 하려면 categoryNameFull, categoryId도 볼 수 있음
                return items.get(0).path("categoryName").asText(null);
            }
        } catch (Exception ignore) { }
        return null;
    }

    // ────────── 구글북스 ──────────
    private String lookupGoogleByIsbn(Book b) {
        try {
            if (!StringUtils.hasText(googleKey)) return null;
            String isbn = TitleNormalizer.cleanIsbn(b.getIsbn());
            if (isbn.isBlank()) return null;
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://www.googleapis.com/books/v1/volumes")
                    .queryParam("q", "isbn:" + isbn)
                    .queryParam("key", googleKey)
                    .toUriString();
            String body = http.getForObject(url, String.class);
            String cat = parseGoogleCategory(body);
            return GenreMapper.mapFromGoogle(cat);
        } catch (Exception ignore) { return null; }
    }

    private String searchGoogleByTitleAuthor(String title, String author) {
        try {
            if (!StringUtils.hasText(googleKey) || title.isBlank()) return null;
            String q = ("intitle:" + title + (author.isBlank() ? "" : " inauthor:" + author)).trim();
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://www.googleapis.com/books/v1/volumes")
                    .queryParam("q", q)
                    .queryParam("key", googleKey)
                    .toUriString();
            String body = http.getForObject(url, String.class);
            String cat = parseGoogleCategory(body);
            return GenreMapper.mapFromGoogle(cat);
        } catch (Exception ignore) { return null; }
    }

    private String searchGoogleByTitleOnly(String title) {
        try {
            if (!StringUtils.hasText(googleKey) || title.isBlank()) return null;
            String q = "intitle:" + title;
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://www.googleapis.com/books/v1/volumes")
                    .queryParam("q", q)
                    .queryParam("key", googleKey)
                    .toUriString();
            String body = http.getForObject(url, String.class);
            String cat = parseGoogleCategory(body);
            return GenreMapper.mapFromGoogle(cat);
        } catch (Exception ignore) { return null; }
    }

    private String parseGoogleCategory(String json) {
        if (!StringUtils.hasText(json)) return null;
        try {
            JsonNode root = om.readTree(json);
            JsonNode items = root.path("items");
            if (items.isArray() && items.size() > 0) {
                JsonNode cats = items.get(0).path("volumeInfo").path("categories");
                if (cats.isArray() && cats.size() > 0) {
                    return cats.get(0).asText(null);
                }
            }
        } catch (Exception ignore) { }
        return null;
    }

    // ────────── util ──────────
    private String safe(String s) { return s == null ? "" : s; }
}

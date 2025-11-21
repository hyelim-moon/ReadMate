package RM.ReadMate.service;

import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AladinService {

    private final WebClient aladinClient =
            WebClient.builder()
                    .baseUrl("https://www.aladin.co.kr/ttb/api")
                    .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                    .build();

    @Value("${aladin.ttb-key:}")
    private String ttbKey;

    /** 알라딘 응답용 DTO (categoryName 포함) */
    public record AladinBook(
            String title,
            String author,
            String publisher,
            String isbn13,
            String description,
            String coverSmallUrl,
            String coverUrl,
            String coverLargeUrl,
            int pageCount,
            String categoryName
    ) {}

    private static String optS(JSONObject o, String k) { return (o != null && o.has(k)) ? String.valueOf(o.opt(k)) : ""; }
    private static int optI(JSONObject o, String k) { return (o != null && o.has(k)) ? o.optInt(k, 0) : 0; }

    /* =========================
       리스트 API
       ========================= */

    /** 베스트셀러 리스트 */
    public List<AladinBook> getBestsellers(int limit) {
        return fetchItemList("Bestseller", limit);
    }

    /** 신간 베스트/주요 신간 리스트 */
    public List<AladinBook> getNewBest(int limit) {
        // ItemNewAll 또는 ItemNewSpecial 중 하나를 사용 — 응답이 있는 쪽으로
        List<AladinBook> list = fetchItemList("ItemNewSpecial", limit);
        if (list.isEmpty()) list = fetchItemList("ItemNewAll", limit);
        return list;
    }

    private List<AladinBook> fetchItemList(String queryType, int limit) {
        List<AladinBook> out = new ArrayList<>();
        try {
            String uri = UriComponentsBuilder.fromPath("/ItemList.aspx")
                    .queryParam("ttbkey", ttbKey)
                    .queryParam("QueryType", queryType)
                    .queryParam("MaxResults", Math.max(1, Math.min(limit, 50)))
                    .queryParam("start", 1)
                    .queryParam("SearchTarget", "Book")
                    .queryParam("output", "js")
                    .queryParam("Version", "20131101")
                    .build().toUriString();

            String json = aladinClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
            if (json == null || json.isBlank()) return out;

            JSONObject root = new JSONObject(json);
            JSONArray items = root.optJSONArray("item");
            if (items == null || items.isEmpty()) return out;

            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.getJSONObject(i);
                out.add(parseItem(it));
            }
            return out;
        } catch (Exception e) {
            return out;
        }
    }

    /* =========================
       개별/검색 API
       ========================= */

    /** ISBN으로 상세 조회 */
    public AladinBook lookupByIsbn(String isbn13) {
        if (isbn13 == null || isbn13.isBlank()) return null;
        try {
            String uri = UriComponentsBuilder.fromPath("/ItemLookUp.aspx")
                    .queryParam("ttbkey", ttbKey)
                    .queryParam("itemIdType", "ISBN13")
                    .queryParam("ItemId", URLEncoder.encode(isbn13, StandardCharsets.UTF_8))
                    .queryParam("cover", "Big")
                    .queryParam("output", "js")
                    .queryParam("Version", "20131101")
                    .build().toUriString();

            String json = aladinClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
            if (json == null || json.isBlank()) return null;

            JSONObject root = new JSONObject(json);
            JSONArray items = root.optJSONArray("item");
            if (items == null || items.isEmpty()) return null;

            JSONObject it = items.getJSONObject(0);
            return parseItem(it);
        } catch (Exception e) {
            return null;
        }
    }

    /** 제목 기반(힌트 포함) 검색 중 최적 1건 */
    public AladinBook searchBestByTitle(String title, String authorHint, String publisherHint) {
        if (title == null || title.isBlank()) return null;
        try {
            String uri = UriComponentsBuilder.fromPath("/ItemSearch.aspx")
                    .queryParam("ttbkey", ttbKey)
                    .queryParam("Query", URLEncoder.encode(title, StandardCharsets.UTF_8))
                    .queryParam("SearchTarget", "Book")
                    .queryParam("MaxResults", 10)
                    .queryParam("output", "js")
                    .queryParam("Version", "20131101")
                    .build().toUriString();

            String json = aladinClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
            if (json == null || json.isBlank()) return null;

            JSONObject root = new JSONObject(json);
            JSONArray items = root.optJSONArray("item");
            if (items == null || items.isEmpty()) return null;

            // 간단 스코어링: 저자/출판사 힌트 일치 가점
            int bestScore = -1;
            JSONObject best = null;
            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.getJSONObject(i);
                String a = optS(it, "author").replaceAll("\\s", "");
                String p = optS(it, "publisher").replaceAll("\\s", "");
                int score = 0;
                if (authorHint != null && !authorHint.isBlank() && a.contains(authorHint.replaceAll("\\s", ""))) score += 2;
                if (publisherHint != null && !publisherHint.isBlank() && p.contains(publisherHint.replaceAll("\\s", ""))) score += 1;
                if (score > bestScore) { bestScore = score; best = it; }
            }
            if (best == null) best = items.getJSONObject(0);
            return parseItem(best);
        } catch (Exception e) {
            return null;
        }
    }

    /* =========================
       파서
       ========================= */

    private AladinBook parseItem(JSONObject it) {
        String title = optS(it, "title");
        String author = optS(it, "author");
        String publisher = optS(it, "publisher");
        String isbn13 = optS(it, "isbn13");
        String desc = optS(it, "description");
        String coverS = optS(it, "coverSmallUrl");
        String cover = optS(it, "cover");
        String coverL = optS(it, "coverLargeUrl");

        int pages = 0;
        JSONObject sub = it.optJSONObject("subInfo");
        if (sub != null) pages = sub.optInt("itemPage", 0);
        if (pages <= 0) pages = it.optInt("itemPage", 0);

        String categoryName = optS(it, "categoryName"); // 원본 카테고리 텍스트

        return new AladinBook(title, author, publisher, isbn13, desc, coverS, cover, coverL, pages, categoryName);
    }
}

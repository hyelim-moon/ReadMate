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

    private final WebClient aladinClient;

    @Value("${aladin.ttb-key}")
    private String ttbKey;

    /** ✅ 베스트셀러 리스트 */
    public List<AladinBook> getBestsellers(int limit) {
        return callItemList("Bestseller", limit, null, "Book");
    }

    /** ✅ 신간 베스트 리스트 */
    public List<AladinBook> getNewBest(int limit) {
        return callItemList("ItemNewSpecial", limit, null, "Book");
    }

    /**
     * ✅ 공통 ItemList 호출
     */
    private List<AladinBook> callItemList(String queryType, int limit, Integer categoryId, String searchTarget) {
        int max = (limit <= 0 ? 20 : Math.min(limit, 50));

        UriComponentsBuilder builder = UriComponentsBuilder.fromPath("")
                .queryParam("ttbkey", ttbKey)
                .queryParam("QueryType", queryType)
                .queryParam("MaxResults", max)
                .queryParam("Start", 1)
                .queryParam("SearchTarget", (searchTarget == null || searchTarget.isBlank()) ? "Book" : searchTarget)
                .queryParam("Output", "JS")
                .queryParam("Version", "20131101");

        if (categoryId != null && categoryId > 0) {
            builder.queryParam("CategoryId", categoryId);
        }

        String uri = builder.build().toUriString();

        String json = aladinClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        List<AladinBook> list = new ArrayList<>();
        if (json == null) return list;

        JSONObject root = new JSONObject(json);
        JSONArray itemArr = root.optJSONArray("item");
        if (itemArr == null) return list;

        for (int i = 0; i < itemArr.length(); i++) {
            JSONObject it = itemArr.getJSONObject(i);
            list.add(fromItemObject(it));
        }
        return list;
    }

    /**
     * ✅ 단권 조회: ISBN13 기준 ItemLookUp 호출
     */
    public AladinBook lookupByIsbn(String isbn13) {
        if (isbn13 == null || isbn13.isBlank()) return null;

        try {
            String uri = UriComponentsBuilder
                    .fromHttpUrl("https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx")
                    .queryParam("ttbkey", ttbKey)
                    .queryParam("ItemId", isbn13)
                    .queryParam("itemIdType", "ISBN13")
                    .queryParam("output", "JS")
                    .queryParam("Version", "20131101")
                    .build()
                    .toUriString();

            String json = aladinClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (json == null) return null;

            JSONObject root = new JSONObject(json);
            JSONArray itemArr = root.optJSONArray("item");
            if (itemArr == null || itemArr.isEmpty()) return null;

            JSONObject it = itemArr.getJSONObject(0);
            return fromItemObject(it);
        } catch (Exception e) {
            System.err.println("❌ Aladin ISBN 조회 오류: " + e.getMessage());
            return null;
        }
    }

    /**
     * ✅ 제목 기반 검색: ItemSearch 호출
     *  - Google/ISBN 으로 못 찾았을 때 보조로 사용
     */
    public AladinBook searchBestByTitle(String title, String authorHint, String publisherHint) {
        if (title == null || title.isBlank()) return null;

        try {
            String encodedTitle = URLEncoder.encode(title, StandardCharsets.UTF_8);
            String uri = UriComponentsBuilder
                    .fromHttpUrl("https://www.aladin.co.kr/ttb/api/ItemSearch.aspx")
                    .queryParam("ttbkey", ttbKey)
                    .queryParam("Query", encodedTitle)
                    .queryParam("QueryType", "Title")
                    .queryParam("SearchTarget", "Book")
                    .queryParam("MaxResults", 10)
                    .queryParam("Start", 1)
                    .queryParam("output", "JS")
                    .queryParam("Version", "20131101")
                    .build()
                    .toUriString();

            String json = aladinClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (json == null) return null;

            JSONObject root = new JSONObject(json);
            JSONArray itemArr = root.optJSONArray("item");
            if (itemArr == null || itemArr.isEmpty()) return null;

            AladinBook best = null;
            int bestScore = -1;

            for (int i = 0; i < itemArr.length(); i++) {
                JSONObject it = itemArr.getJSONObject(i);
                AladinBook candidate = fromItemObject(it);
                int score = scoreCandidate(candidate, authorHint, publisherHint);
                if (score > bestScore) {
                    bestScore = score;
                    best = candidate;
                }
            }

            return best;
        } catch (Exception e) {
            System.err.println("❌ Aladin 제목 검색 오류: " + e.getMessage());
            return null;
        }
    }

    /** ✅ JSON item 객체 → AladinBook 변환 */
    private AladinBook fromItemObject(JSONObject it) {
        JSONObject subInfo = it.optJSONObject("subInfo");
        int pageCount = (subInfo != null) ? subInfo.optInt("itemPage", 0) : 0;

        String coverSmall = it.optString("coverSmallUrl", "");
        String cover      = it.optString("cover", "");
        String coverLarge = it.optString("coverLargeUrl", "");

        return new AladinBook(
                it.optString("title", ""),
                it.optString("author", ""),
                it.optString("publisher", ""),
                it.optString("isbn13", ""),
                it.optString("description", ""),
                coverSmall,
                cover,
                coverLarge,
                pageCount
        );
    }

    /** ✅ 제목 검색 후보 스코어링 (저자/출판사 힌트 + 페이지수 존재 여부) */
    private int scoreCandidate(AladinBook book, String authorHint, String publisherHint) {
        int score = 0;

        if (!isBlank(book.author()) && !isBlank(authorHint)) {
            String cand = normalize(book.author());
            String hint = normalize(authorHint);
            if (cand.contains(hint) || hint.contains(cand)) score += 3;
        }

        if (!isBlank(book.publisher()) && !isBlank(publisherHint)) {
            String cand = normalize(book.publisher());
            String hint = normalize(publisherHint);
            if (cand.contains(hint) || hint.contains(cand)) score += 2;
        }

        if (book.pageCount() > 0) score += 1;

        return score;
    }

    private String normalize(String s) {
        return s == null ? "" : s.replaceAll("\\s+", "").toLowerCase();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /** ✅ 알라딘 응답용 DTO */
    public record AladinBook(
            String title,
            String author,
            String publisher,
            String isbn13,
            String description,
            String coverSmallUrl,  // 썸네일
            String coverUrl,       // 기본
            String coverLargeUrl,  // 큰 이미지
            int pageCount
    ) {
        /** ✅ 고해상도 cover500 파생 URL */
        public String cover500Url() {
            String base = (coverLargeUrl != null && !coverLargeUrl.isBlank())
                    ? coverLargeUrl
                    : (coverUrl != null && !coverUrl.isBlank() ? coverUrl : coverSmallUrl);

            if (base == null || base.isBlank()) return "";

            return base.replace("/coversum/", "/cover500/")
                    .replace("/cover/", "/cover500/");
        }
    }
}

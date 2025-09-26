package RM.ReadMate.service;

import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AladinService {

    private final WebClient aladinClient;

    @Value("${aladin.ttb-key}")
    private String ttbKey;

    /** 베스트셀러 */
    public List<AladinBook> getBestsellers(int limit) {
        return callItemList("Bestseller", limit, null, "Book");
    }

    /** 신간 베스트 */
    public List<AladinBook> getNewBest(int limit) {
        return callItemList("ItemNewSpecial", limit, null, "Book");
    }

    /**
     * 공통 호출
     */
    private List<AladinBook> callItemList(String queryType, int limit, Integer categoryId, String searchTarget) {
        int max = (limit <= 0 ? 20 : Math.min(limit, 50));

        var builder = UriComponentsBuilder.fromPath("")
                .queryParam("ttbkey", ttbKey)
                .queryParam("QueryType", queryType)
                .queryParam("MaxResults", max)
                .queryParam("Start", 1)
                .queryParam("SearchTarget", (searchTarget == null || searchTarget.isBlank()) ? "Book" : searchTarget)
                .queryParam("Output", "JS")
                .queryParam("Version", "20131101");

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

            JSONObject subInfo = it.optJSONObject("subInfo");
            int pageCount = (subInfo != null) ? subInfo.optInt("itemPage", 0) : 0;

            // 알라딘 응답 필드명: cover(기본), coverSmallUrl, coverLargeUrl
            String coverSmall = it.optString("coverSmallUrl", "");
            String cover      = it.optString("cover", "");
            String coverLarge = it.optString("coverLargeUrl", "");

            list.add(new AladinBook(
                    it.optString("title", ""),
                    it.optString("author", ""),
                    it.optString("publisher", ""),
                    it.optString("isbn13", ""),
                    it.optString("description", ""),
                    coverSmall,
                    cover,
                    coverLarge,
                    pageCount
            ));
        }
        return list;
    }

    /** 알라딘 응답용 DTO */
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
                    : (coverUrl != null ? coverUrl : coverSmallUrl);

            if (base == null || base.isBlank()) return "";

            return base.replace("/coversum/", "/cover500/")
                    .replace("/cover/", "/cover500/");
        }
    }
}
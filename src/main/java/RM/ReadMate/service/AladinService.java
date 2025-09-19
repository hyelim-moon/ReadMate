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

    /** 기존: Bestseller */
    public List<AladinBook> getBestsellers(int limit) {
        return callItemList("Bestseller", limit, null, "Book");
    }

    /** 기존: Editor Picks (카테고리 미지정은 문서상 비권장/미지원일 수 있음) */
    public List<AladinBook> getEditorPicks(int limit) {
        // 카테고리 없이 호출해야 한다면 null로 두되, 가급적 아래의 byCategory 사용 권장
        return callItemList("ItemEditorChoice", limit, null, "Book");
    }

    /** ✅ 신규: Editor Picks by CategoryId */
    public List<AladinBook> getEditorPicksByCategory(int categoryId, int limit) {
        return callItemList("ItemEditorChoice", limit, categoryId, "Book");
    }

    /**
     * 공통 호출 (QueryType + [선택]CategoryId + SearchTarget)
     * - QueryType 예: ItemEditorChoice, Bestseller, ItemNewAll, ...
     * - SearchTarget 예: "Book", "Foreign", "Music" (문서 기준)
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

        // ✅ 편집자 추천은 카테고리 기반이라면 CategoryId 추가
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

            JSONObject subInfo = it.optJSONObject("subInfo");
            int pageCount = (subInfo != null) ? subInfo.optInt("itemPage", 0) : 0;

            list.add(new AladinBook(
                    it.optString("title", ""),
                    it.optString("author", ""),
                    it.optString("publisher", ""),
                    it.optString("isbn13", ""),
                    it.optString("description", ""),
                    it.optString("cover", ""),
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
            String coverUrl,
            int pageCount
    ) {}
}
package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
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

@Service
@RequiredArgsConstructor
public class GoogleBooksService {

    private final WebClient googleBooksClient;

    @Value("${googlebooks.api-key}")
    private String apiKey;

    /** ISBN 우선 보강 */
    public BookDto enrichByIsbn(String isbn13) {
        if (isbn13 == null || isbn13.isBlank()) return null;

        try {
            String q = "isbn:" + URLEncoder.encode(isbn13, StandardCharsets.UTF_8);
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("q", q)
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            String json = googleBooksClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return toDto(json, null, isbn13);
        } catch (Exception e) {
            System.err.println("❌ GoogleBooks ISBN 조회 오류: " + e.getMessage());
            return null;
        }
    }

    /** 제목 검색 보강 (ISBN 없을 때 fallback) */
    public BookDto searchByTitle(String title) {
        if (title == null || title.isBlank()) return null;

        try {
            String q = URLEncoder.encode(title, StandardCharsets.UTF_8);
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("q", q)
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            String json = googleBooksClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return toDto(json, title, null);
        } catch (Exception e) {
            System.err.println("❌ GoogleBooks 제목 조회 오류: " + e.getMessage());
            return null;
        }
    }

    /** JSON → BookDto 변환 */
    private BookDto toDto(String json, String fallbackTitle, String fallbackIsbn) {
        if (json == null) return null;

        JSONObject root = new JSONObject(json);
        JSONArray items = root.optJSONArray("items");
        if (items == null || items.isEmpty()) return null;

        JSONObject volumeInfo = items.getJSONObject(0).optJSONObject("volumeInfo");
        if (volumeInfo == null) return null;

        String isbn = extractIsbn(volumeInfo, fallbackIsbn);

        // ✅ 이미지 선택: extraLarge → large → medium → thumbnail → smallThumbnail
        String image = "";
        if (volumeInfo.has("imageLinks")) {
            JSONObject il = volumeInfo.getJSONObject("imageLinks");
            image = firstNonEmpty(
                    il.optString("extraLarge", ""),
                    il.optString("large", ""),
                    il.optString("medium", ""),
                    il.optString("thumbnail", ""),
                    il.optString("smallThumbnail", "")
            );
            image = normalizeHttps(image);
            image = upgradeGoogleContentZoom(image); // Google Books content면 zoom=5로 업그레이드
        }

        return BookDto.builder()
                .isbn(isbn)
                .bookName(volumeInfo.optString("title", fallbackTitle != null ? fallbackTitle : ""))
                .author(volumeInfo.has("authors") ? volumeInfo.getJSONArray("authors").optString(0) : "")
                .publisher(volumeInfo.optString("publisher", ""))
                .genre(volumeInfo.has("categories") ? volumeInfo.getJSONArray("categories").optString(0) : "")
                .content(volumeInfo.optString("description", ""))
                .bookImage(image)
                .pageCount(volumeInfo.optInt("pageCount", 0))
                .build();
    }

    /** ISBN 추출 */
    private String extractIsbn(JSONObject volumeInfo, String fallback) {
        if (volumeInfo.has("industryIdentifiers")) {
            JSONArray ids = volumeInfo.getJSONArray("industryIdentifiers");
            for (int i = 0; i < ids.length(); i++) {
                JSONObject idObj = ids.getJSONObject(i);
                String type = idObj.optString("type", "");
                String val  = idObj.optString("identifier", "");
                if ("ISBN_13".equalsIgnoreCase(type) && !val.isBlank()) return val;
            }
            for (int i = 0; i < ids.length(); i++) {
                String val = ids.getJSONObject(i).optString("identifier", "");
                if (!val.isBlank()) return val;
            }
        }
        return fallback != null ? fallback : "";
    }

    /** 여러 후보 중 첫 번째 non-empty 반환 */
    private String firstNonEmpty(String... values) {
        for (String v : values) if (v != null && !v.isBlank()) return v;
        return "";
    }

    /** http → https 변환 */
    private String normalizeHttps(String url) {
        if (url == null || url.isBlank()) return "";
        String u = url.trim();
        if (u.startsWith("http://")) {
            u = "https://" + u.substring("http://".length());
        }
        return u;
    }

    /**
     * Google Books content URL이면 zoom=5로 업그레이드
     * 예: https://books.google.com/books/content?id=...&zoom=1
     *  → https://books.google.com/books/content?id=...&zoom=5
     */
    private String upgradeGoogleContentZoom(String url) {
        if (url == null || url.isBlank()) return "";
        String u = url;
        if (u.contains("books.google.com/books/content")) {
            if (u.contains("zoom=")) {
                u = u.replaceAll("zoom=\\d+", "zoom=5");
            } else {
                u += (u.contains("?") ? "&" : "?") + "zoom=5";
            }
            u = normalizeHttps(u);
        }
        return u;
    }
}

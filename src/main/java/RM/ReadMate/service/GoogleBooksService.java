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

    private BookDto toDto(String json, String fallbackTitle, String fallbackIsbn) {
        if (json == null) return null;

        JSONObject root = new JSONObject(json);
        JSONArray items = root.optJSONArray("items");
        if (items == null || items.isEmpty()) return null;

        JSONObject volumeInfo = items.getJSONObject(0).optJSONObject("volumeInfo");
        if (volumeInfo == null) return null;

        String isbn = extractIsbn(volumeInfo, fallbackIsbn);

        String image = "";
        if (volumeInfo.has("imageLinks")) {
            JSONObject il = volumeInfo.getJSONObject("imageLinks");
            // smallThumbnail, thumbnail 순으로 시도
            image = il.optString("thumbnail",
                    il.optString("smallThumbnail", ""));
            if (!image.isBlank()) {
                // ✅ http → https 치환 (혼합콘텐츠 방지)
                image = image.replaceFirst("^http://", "https://");
            }
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
}

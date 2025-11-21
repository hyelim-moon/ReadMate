package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
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
public class GoogleBooksService {

    private final WebClient googleBooksClient;

    @Value("${google.books.api-key:}")
    private String apiKey;

    public GoogleBooksService() {
        this.googleBooksClient = WebClient.builder()
                .baseUrl("https://www.googleapis.com/books/v1/volumes")
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /** ISBN 우선 보강 */
    public BookDto enrichByIsbn(String isbn13) {
        if (isbn13 == null || isbn13.isBlank()) return null;
        try {
            String q = "isbn:" + URLEncoder.encode(isbn13, StandardCharsets.UTF_8);
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("q", q)
                    .queryParam("key", apiKey)
                    .build().toUriString();

            String json = googleBooksClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
            return pickBest(json);
        } catch (Exception e) {
            return null;
        }
    }

    /** 제목 기반 검색 */
    public BookDto searchByTitle(String title) {
        if (title == null || title.isBlank()) return null;
        try {
            String q = URLEncoder.encode(title, StandardCharsets.UTF_8);
            String uri = UriComponentsBuilder.fromPath("")
                    .queryParam("q", q)
                    .queryParam("key", apiKey)
                    .build().toUriString();

            String json = googleBooksClient.get().uri(uri).retrieve().bodyToMono(String.class).block();
            return pickBest(json);
        } catch (Exception e) {
            return null;
        }
    }

    private BookDto pickBest(String json) {
        if (json == null || json.isBlank()) return null;
        JSONObject root = new JSONObject(json);
        JSONArray items = root.optJSONArray("items");
        if (items == null || items.isEmpty()) return null;

        JSONObject item = items.getJSONObject(0);
        JSONObject info = item.optJSONObject("volumeInfo");
        if (info == null) return null;

        String title = optS(info, "title");
        String publisher = optS(info, "publisher");
        String description = optS(info, "description");
        int pageCount = info.optInt("pageCount", 0);

        // authors
        String author = "";
        JSONArray authors = info.optJSONArray("authors");
        if (authors != null && !authors.isEmpty()) {
            author = authors.join(", ").replace("\"", "");
        }

        // categories (원본 텍스트 유지; 첫 항목이 대분류에 가까움)
        String genreRaw = "";
        JSONArray categories = info.optJSONArray("categories");
        if (categories != null && !categories.isEmpty()) {
            genreRaw = categories.getString(0);               // 대분류 원본
            // 필요 시 전체를 ' > '로 합칩니다: categories.join(" > ").replace("\"","")
        }

        // 이미지
        String imageUrl = "";
        JSONObject images = info.optJSONObject("imageLinks");
        if (images != null) {
            // 큰 이미지 우선
            imageUrl = firstNonBlank(
                    optS(images, "extraLarge"),
                    optS(images, "large"),
                    optS(images, "medium"),
                    optS(images, "thumbnail"),
                    optS(images, "smallThumbnail")
            );
            imageUrl = upgradeGoogleContentZoom(imageUrl);
        }

        return BookDto.builder()
                .isbn(extractIsbn13(info))
                .bookName(title)
                .author(author)
                .publisher(publisher)
                .genre(genreRaw)           // ✅ 원본 카테고리 텍스트
                .content(description)
                .bookImage(imageUrl)
                .pageCount(pageCount)
                .build();
    }

    private String extractIsbn13(JSONObject info) {
        JSONArray ids = info.optJSONArray("industryIdentifiers");
        if (ids == null) return "";
        for (int i = 0; i < ids.length(); i++) {
            JSONObject id = ids.getJSONObject(i);
            if ("ISBN_13".equalsIgnoreCase(optS(id, "type"))) {
                return optS(id, "identifier").replaceAll("[^0-9Xx]", "");
            }
        }
        return "";
    }

    private String firstNonBlank(String... arr) {
        if (arr == null) return "";
        for (String s : arr) if (s != null && !s.isBlank()) return s.trim();
        return "";
    }

    private String optS(JSONObject o, String k) {
        return (o != null && o.has(k)) ? String.valueOf(o.opt(k)) : "";
    }

    private String upgradeGoogleContentZoom(String url) {
        if (url == null || url.isBlank()) return "";
        String u = url.trim();
        if (u.contains("books.google.com/books/content")) {
            if (u.contains("zoom=")) {
                u = u.replaceAll("zoom=\\d+", "zoom=5");
            } else {
                u += (u.contains("?") ? "&" : "?") + "zoom=5";
            }
            if (u.startsWith("http://")) u = u.replaceFirst("^http://", "https://");
        }
        return u;
    }
}

package RM.ReadMate.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {
    @Value("${gemini.api-key:}") private String apiKey;
    @Value("${gemini.model:gemini-1.5-flash}") private String model;
    @Value("${gemini.api-version:v1}") private String apiVersion; // ← 추가

    private final WebClient.Builder webClientBuilder;

    private WebClient client() {
        return webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("x-goog-api-key", apiKey)
                .build();
    }

    public String ask(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return "에러: GEMINI_API_KEY 환경변수가 비어 있습니다.";
        }

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        // v1 또는 v1beta를 yml에서 고를 수 있게
        String path = "/" + apiVersion + "/models/" + model + ":generateContent";

        try {
            // 상태코드와 본문을 모두 확보
            var respMono = client().post()
                    .uri(path)
                    .bodyValue(body)
                    .exchangeToMono(r ->
                            r.bodyToMono(String.class)
                                    .map(b -> new ApiResult(r.statusCode().value(), b))
                    );

            ApiResult ar = respMono.block();
            if (ar == null) return "알 수 없는 오류";

            if (ar.code >= 200 && ar.code < 300) {
                JsonObject root = JsonParser.parseString(ar.body).getAsJsonObject();
                return root.getAsJsonArray("candidates")
                        .get(0).getAsJsonObject()
                        .getAsJsonObject("content")
                        .getAsJsonArray("parts")
                        .get(0).getAsJsonObject()
                        .get("text").getAsString();
            }

            // 404일 때 친절한 힌트
            if (ar.code == 404) {
                return "모델을 찾지 못했습니다. ("
                        + model + ", " + apiVersion + ")\n"
                        + "👉 yml에서 api-version을 v1로 바꾸고 모델을 "
                        + "`gemini-1.5-flash`(또는 `gemini-1.5-flash-latest`)로 설정하세요.\n"
                        + "원문: " + ar.body;
            }

            return "Gemini API 오류 (" + ar.code + "): " + ar.body;

        } catch (Exception e) {
            return "예외: " + e.getMessage();
        }
    }
    public String listModels() {
        String path = "/v1beta/models"; // 목록은 v1beta 예시가 많음
        return client().get().uri(path).retrieve().bodyToMono(String.class).block();
    }

    private record ApiResult(int code, String body) {}
}


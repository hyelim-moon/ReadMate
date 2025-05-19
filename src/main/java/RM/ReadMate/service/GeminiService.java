package RM.ReadMate.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Scanner;

@Service
public class GeminiService {
    // ✅ API Key 없이 사용하는 Vertex AI Gemini API 엔드포인트
    private static final String ENDPOINT =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public String ask(String prompt) {
        try {
            // ✅ OAuth 인증 - 두 개의 스코프 포함
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(new FileInputStream(System.getenv("GOOGLE_APPLICATION_CREDENTIALS")))
                    .createScoped(List.of(
                            "https://www.googleapis.com/auth/cloud-platform",
                            "https://www.googleapis.com/auth/generative-language"
                    ));
            credentials.refreshIfExpired();
            String token = credentials.getAccessToken().getTokenValue();

            // ✅ 디버깅 출력
            System.out.println("ACCESS TOKEN = " + token);
            System.out.println("Authorization = Bearer " + token);

            // ✅ 요청 본문
            String body = """
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }]
            }
            """.formatted(prompt);
            System.out.println("Body = " + body);

            // ✅ HTTP POST 요청
            URL url = new URL(ENDPOINT);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.getOutputStream().write(body.getBytes());
            System.out.println("URL = " + url);

            // ✅ 응답 받기
            Scanner scanner = new Scanner(conn.getInputStream());
            String response = scanner.useDelimiter("\\A").next();
            scanner.close();

            // ✅ 응답 파싱
            JsonObject json = JsonParser.parseString(response).getAsJsonObject();
            return json.getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();

        } catch (Exception e) {
            return "에러 발생: " + e.getMessage();
        }
    }
}

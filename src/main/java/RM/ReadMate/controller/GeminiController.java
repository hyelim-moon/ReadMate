package RM.ReadMate.controller;

import RM.ReadMate.service.GeminiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {
    private final GeminiService geminiService;
    public GeminiController(GeminiService geminiService) { this.geminiService = geminiService; }

    // JSON 바디: { "text": "..."} 또는 { "prompt": "..." }
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> askJson(@RequestBody Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            return ResponseEntity.badRequest().body("요청 본문이 비었습니다.");
        }
        Object v = body.get("text");
        if (v == null) v = body.get("prompt");
        String prompt = v == null ? "" : v.toString();
        if (prompt.isBlank()) {
            return ResponseEntity.badRequest().body("prompt/text 값이 비었습니다.");
        }
        return ResponseEntity.ok(geminiService.ask(prompt));
    }

    // 텍스트 바디: text/plain
    @PostMapping(consumes = MediaType.TEXT_PLAIN_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> askPlain(@RequestBody String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body("prompt/text 값이 비었습니다.");
        }
        return ResponseEntity.ok(geminiService.ask(prompt));
    }

    @GetMapping("/models")
    public ResponseEntity<String> models() {
        return ResponseEntity.ok(geminiService.listModels());
    }

}

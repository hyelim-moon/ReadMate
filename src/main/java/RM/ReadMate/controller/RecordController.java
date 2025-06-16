package RM.ReadMate.controller;

import RM.ReadMate.entity.Record;
import RM.ReadMate.service.RecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "http://localhost:3000") // CORS 허용 (React용)
public class RecordController {

    private final RecordService recordService;

    @Autowired
    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createRecord(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam("content") String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            Record record = Record.builder()
                    .title(title)
                    .author(author)
                    .publisher(publisher)
                    .genre(genre)
                    .content(content)
                    .build();

            Record saved = recordService.saveRecord(userId, record, photo);

            // 메시지와 함께 반환 (포인트 지급 완료 메시지 추가)
            return ResponseEntity.ok(Map.of(
                    "record", saved,
                    "message", "포인트 10점이 지급되었습니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 중 오류 발생: " + e.getMessage());
        }
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Record>> getRecordsByUserId(@PathVariable Long userId) {
        List<Record> records = recordService.getRecordsByUserId(userId);
        return ResponseEntity.ok(records);
    }

    // 모든 독서 기록 가져오기
    @GetMapping
    public ResponseEntity<List<Record>> getAllRecords() {
        return ResponseEntity.ok(recordService.getAllRecords());
    }

    // 특정 독서 기록 불러오기
    @GetMapping("/{id}")
    public ResponseEntity<Record> getRecordById(@PathVariable Long id) {
        Record record = recordService.getRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }

    // 독서 기록 수정 (이미지 삭제 기능 포함)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateRecord(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "removePhoto", required = false, defaultValue = "false") boolean removePhoto  // 삭제 플래그 추가
    ) {
        try {
            Record updated = recordService.updateRecord(id, title, author, publisher, genre, content, photo, removePhoto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("업데이트 중 오류 발생: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        try {
            boolean deleted = recordService.deleteRecord(id);
            if (deleted) {
                return ResponseEntity.noContent().build(); // 204 No Content
            } else {
                return ResponseEntity.notFound().build(); // 404 Not Found
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("삭제 중 오류 발생: " + e.getMessage());
        }
    }


}

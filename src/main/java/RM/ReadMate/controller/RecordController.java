package RM.ReadMate.controller;

import RM.ReadMate.entity.Record;
import RM.ReadMate.service.RecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
            @RequestParam("review") String review,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            Record record = Record.builder()
                    .title(title)
                    .author(author)
                    .publisher(publisher)
                    .genre(genre)
                    .review(review)
                    .build();

            Record saved = recordService.saveRecord(userId, record, photo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("저장 중 오류 발생: " + e.getMessage());
        }
    }

    // 모든 독서 기록 가져오기
    @GetMapping
    public ResponseEntity<List<Record>> getAllRecords() {
        return ResponseEntity.ok(recordService.getAllRecords());
    }
    
    //특정 독서 기록 불러오기
    @GetMapping("/{id}")
    public ResponseEntity<Record> getRecordById(@PathVariable Long id) {
        Record record = recordService.getRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }
}

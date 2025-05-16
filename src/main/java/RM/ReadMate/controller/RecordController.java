package RM.ReadMate.controller;

import RM.ReadMate.entity.Record;
import RM.ReadMate.service.RecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/records")
public class RecordController {

    private final RecordService recordService;

    @Autowired
    public RecordController(RecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping
    public ResponseEntity<?> createRecord(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "review", required = false) String review,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        Record record = Record.builder()
                .title(title)
                .author(author)
                .publisher(publisher)
                .genre(genre)
                .review(review)
                .build();

        Record saved = recordService.saveRecord(userId, record, photo);
        return ResponseEntity.ok(saved);
    }
}

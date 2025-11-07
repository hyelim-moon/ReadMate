package RM.ReadMate.controller;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.security.JwtTokenProvider;
import RM.ReadMate.service.RecordService;
import RM.ReadMate.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "http://localhost:3000") // CORS 허용 (React용)
public class RecordController {

    private final RecordService recordService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public RecordController(RecordService recordService, JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.recordService = recordService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    // 로그인한 사용자의 기록만 반환
    @GetMapping
    public ResponseEntity<?> getMyRecords(@RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "").trim();

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);

            List<Record> records = recordService.getRecordsByUserid(userid);
            return ResponseEntity.ok(records);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("기록 조회 중 오류 발생: " + e.getMessage());
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createRecord(
            Authentication authentication,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam("content") String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            String token = authHeader.replace("Bearer ", "").trim();

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);
            User user = userService.findByUserid(userid); // ✅ String → User
            Long userId = user.getId(); // ✅ Long 타입 추출


            Record record = Record.builder()
                    .title(title)
                    .author(author)
                    .publisher(publisher)
                    .genre(genre)
                    .content(content)
                    .user(user) // ✅ 여기 핵심!
                    .recordDate(LocalDate.now()) // 현재 날짜 추가
                    .build();

            Record saved = recordService.saveRecord(userId, record, photo);

            userService.addPoints(userId, 10);

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

    // 특정 독서 기록 불러오기
    @GetMapping("/{id}")
    public ResponseEntity<?> getRecordById(
            @PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        try {
            String token = authHeader.replace("Bearer ", "").trim();

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);
            Record record = recordService.getRecordById(id);

            if (record == null) {
                return ResponseEntity.notFound().build();
            }

            // 권한 체크: record.getUser()가 null일 수 있으니 null 체크도 하세요
            if (record.getUser() == null || !record.getUser().getUserid().equals(userid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
            }

            return ResponseEntity.ok(record);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("오류 발생: " + e.getMessage());
        }
    }

    // 독서 기록 수정 (이미지 삭제 기능 포함)
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateRecord(
            @PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam(value = "publisher", required = false) String publisher,
            @RequestParam(value = "genre", required = false) String genre,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "removePhoto", required = false, defaultValue = "false") boolean removePhoto
    ) {
        try {
            String token = authHeader.replace("Bearer ", "").trim();

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);
            Record record = recordService.getRecordById(id);
            if (record == null) {
                return ResponseEntity.notFound().build();
            }

            if (record.getUser() == null || !record.getUser().getUserid().equals(userid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
            }

            Record updated = recordService.updateRecord(id, title, author, publisher, genre, content, photo, removePhoto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("업데이트 중 오류 발생: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(
            @PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "").trim();

            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 토큰입니다.");
            }

            String userid = jwtTokenProvider.getUseridFromToken(token);
            Record record = recordService.getRecordById(id);
            if (record == null) {
                return ResponseEntity.notFound().build();
            }

            if (record.getUser() == null || !record.getUser().getUserid().equals(userid)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("권한이 없습니다.");
            }

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

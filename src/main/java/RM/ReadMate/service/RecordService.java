package RM.ReadMate.service;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate; // LocalDate import 추가
import java.util.List;

@Service
public class RecordService {

    private final RecordRepository recordRepository;
    private final UserService userService;

    @Autowired
    public RecordService(RecordRepository recordRepository, UserService userService) {
        this.recordRepository = recordRepository;
        this.userService = userService;
    }

    public List<Record> getRecordsByUserId(Long userId) {
        // userId로 User 객체를 먼저 찾는 게 더 정확
        var user = userService.findUserById(userId);
        return recordRepository.findByUser(user);
    }

    // userid(String)로 Records 조회
    public List<Record> getRecordsByUserid(String userid) {
        User user = userService.findByUserid(userid);
        return recordRepository.findByUser(user);
    }

    // 저장 메서드 (신규)
    public Record saveRecord(Long userId, Record record, MultipartFile photo) {
        try {
            if (record.getContent() != null && record.getContent().length() > 1000) {
                throw new IllegalArgumentException("감상문은 1000자 이내로 작성해주세요.");
            }

            if (photo != null && !photo.isEmpty()) {
                String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toString();
                Files.createDirectories(Paths.get(uploadDir));
                Path filePath = Paths.get(uploadDir, photo.getOriginalFilename());
                Files.write(filePath, photo.getBytes());
                record.setPhoto("/uploads/" + photo.getOriginalFilename());
            } else {
                record.setPhoto(null);
            }

            // 유저 연결은 저장 전에 반드시 해줘야 함
            if (userId != null) {
                var user = userService.findUserById(userId);
                record.setUser(user);
            }

            // 새로운 독서 기록은 항상 현재 날짜로 recordDate 설정
            record.setRecordDate(LocalDate.now());

            Record savedRecord = recordRepository.save(record);

            // 포인트 지급
            if (userId != null) {
                userService.addPoints(userId, 10);
            }

            return savedRecord;

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    // 수정 메서드
    public Record updateRecord(Long id, String title, String author, String publisher, String genre, String content, MultipartFile photo, boolean removePhoto) {
        try {
            Record existingRecord = recordRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("해당 ID의 기록이 없습니다: " + id));

            if (content != null && content.length() > 1000) {
                throw new IllegalArgumentException("감상문은 1000자 이내로 작성해주세요.");
            }

            existingRecord.setTitle(title);
            existingRecord.setAuthor(author);
            existingRecord.setPublisher(publisher);
            existingRecord.setGenre(genre);
            existingRecord.setContent(content);
            existingRecord.setRecordDate(LocalDate.now());

            String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toString();

            // 이미지 삭제 요청 시
            if (removePhoto) {
                if (existingRecord.getPhoto() != null) {
                    try {
                        String filename = Paths.get(existingRecord.getPhoto()).getFileName().toString();
                        Path photoPath = Paths.get(uploadDir, filename);
                        Files.deleteIfExists(photoPath);
                    } catch (IOException e) {
                        System.err.println("기존 사진 삭제 실패: " + e.getMessage());
                    }
                }
                existingRecord.setPhoto(null);
            }

            // 새 이미지가 있으면 저장
            if (photo != null && !photo.isEmpty()) {
                Files.createDirectories(Paths.get(uploadDir));
                Path filePath = Paths.get(uploadDir, photo.getOriginalFilename());
                Files.write(filePath, photo.getBytes());
                existingRecord.setPhoto("/uploads/" + photo.getOriginalFilename());
            }

            return recordRepository.save(existingRecord);

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    public Record getRecordById(Long id) {
        return recordRepository.findByIdWithUser(id);
    }

    public boolean deleteRecord(Long id) {
        Record record = recordRepository.findById(id).orElse(null);
        if (record != null) {
            if (record.getPhoto() != null) {
                try {
                    String filename = Paths.get(record.getPhoto()).getFileName().toString();
                    String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toString();
                    Path photoPath = Paths.get(uploadDir, filename);
                    Files.deleteIfExists(photoPath);
                } catch (IOException e) {
                    System.err.println("사진 삭제 실패: " + e.getMessage());
                }
            }
            recordRepository.delete(record);
            return true;
        }
        return false;
    }
}

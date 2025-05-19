package RM.ReadMate.service;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.RecordRepository;
import RM.ReadMate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class RecordService {

    private final RecordRepository recordRepository;
    private final UserRepository userRepository;

    @Autowired
    public RecordService(RecordRepository recordRepository, UserRepository userRepository) {
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
    }

    public Record saveRecord(Long userId, Record record, MultipartFile photo) {
        try {
            // 감상문 길이 체크 (1000자 이상은 에러)
            if (record.getReview().length() > 1000) {
                throw new IllegalArgumentException("감상문은 1000자 이내로 작성해주세요.");
            }

            if (userId != null) {
                userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                record.setUserId(userId);
            } else {
                record.setUserId(null); // 비회원 저장 허용
            }

            // 사진 저장
            if (photo != null && !photo.isEmpty()) {
                String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toString();
                Files.createDirectories(Paths.get(uploadDir));
                Path filePath = Paths.get(uploadDir, photo.getOriginalFilename());
                Files.write(filePath, photo.getBytes());
                record.setPhoto("/uploads/" + photo.getOriginalFilename()); // 상대 경로로 저장
            } else {
                record.setPhoto(null);
            }

            return recordRepository.save(record);

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }


    public Record getRecordById(Long id) {
        return recordRepository.findById(id).orElse(null);
    }

    // 전체 기록 조회
    public List<Record> getAllRecords() {
        return recordRepository.findAll();
    }
}

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
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

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
            if (userId != null) {
                // 로그인 사용자인 경우만 유저 정보 확인
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
                record.setPhoto(filePath.toString());
            } else {
                record.setPhoto(null);
            }

            return recordRepository.save(record);

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    public Record getRecordById(Long id) {
        return recordRepository.findById(id).orElse(null);
    }
}
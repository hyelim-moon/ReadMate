package RM.ReadMate.service;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.RecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordRepository recordRepository;
    private final UserService userService;

    public List<Record> getRecordsByUserId(Long userId) {
        var user = userService.findUserById(userId);
        Sort defaultSort = Sort.by(Sort.Direction.DESC, "recordDate");
        return recordRepository.findByUser(user, defaultSort);
    }

    public List<Record> getRecordsByUserid(String userid, String sortBy) {
        User user = userService.findByUserid(userid);
        Sort sort;
        if ("oldest".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "recordDate");
        } else { // 기본값: latest
            sort = Sort.by(Sort.Direction.DESC, "recordDate");
        }
        return recordRepository.findByUser(user, sort);
    }

    // 특정 사용자의 최신 독서 기록 N개를 가져오는 메서드
    public List<Record> getLatestRecordsForUser(String userid, int limit) {
        User user = userService.findByUserid(userid);
        // findTopNByUserOrderByRecordDateDesc는 N을 직접 지정해야 하므로,
        // findByUser와 Sort를 조합하여 limit 처리
        return recordRepository.findByUser(user, Sort.by(Sort.Direction.DESC, "recordDate"))
                               .stream()
                               .limit(limit)
                               .collect(Collectors.toList());
    }

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

            if (userId != null) {
                var user = userService.findUserById(userId);
                record.setUser(user);
            }

            record.setRecordDate(LocalDateTime.now());

            Record savedRecord = recordRepository.save(record);

            if (userId != null) {
                userService.addPoints(userId, 10, "독서 기록 작성");
            }

            return savedRecord;

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

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
            existingRecord.setRecordDate(LocalDateTime.now());

            String uploadDir = Paths.get(System.getProperty("user.dir"), "uploads").toString();

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

    @Transactional
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

    @Transactional
    public void deleteRecordsByIds(List<Long> recordIds, String userid) {
        User user = userService.findByUserid(userid);
        List<Record> recordsToDelete = recordRepository.findAllById(recordIds);

        // 사용자의 기록인지 확인 및 파일 삭제
        for (Record record : recordsToDelete) {
            if (!record.getUser().getId().equals(user.getId())) {
                throw new SecurityException("삭제 권한이 없는 기록이 포함되어 있습니다.");
            }
            // 개별 파일 삭제
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
        }
        // 모든 권한 확인 후 일괄 삭제
        recordRepository.deleteAllByIdInBatch(recordIds);
    }
}

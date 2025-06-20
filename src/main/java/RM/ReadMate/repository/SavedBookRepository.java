package RM.ReadMate.repository;

import RM.ReadMate.entity.SavedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedBookRepository extends JpaRepository<SavedBook, Long> {
    // 사용자 ID로 저장된 책 목록 조회
    List<SavedBook> findByUserId(Long userId);
}

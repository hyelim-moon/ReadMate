package RM.ReadMate.repository;

import RM.ReadMate.entity.SavedBook;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavedBookRepository extends JpaRepository<SavedBook, Long> {
    // 사용자 ID로 저장된 책 목록 조회
    @EntityGraph(attributePaths = {"book", "user"})
    List<SavedBook> findByUserId(@Param("userId") Long userId);
}

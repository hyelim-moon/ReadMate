package RM.ReadMate.repository;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; // LocalDateTime 임포트
import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {

    List<Record> findByUser(User user, Sort sort);

    // 특정 사용자의 최신 독서 기록 N개를 가져오는 메서드 추가
    List<Record> findTop5ByUserOrderByRecordDateDesc(User user); // 마이페이지용 최신 5개 기록

    @Query("SELECT r FROM Record r JOIN FETCH r.user WHERE r.id = :id")
    Record findByIdWithUser(@Param("id") Long id);

    // TeamChallengeService에서 호출하는 시그니처와 일치하도록 수정
    // 필드 이름은 RecordDate로 유지
    int countByUserAndRecordDateBetween(User user, LocalDateTime startDate, LocalDateTime endDate);

    // findByUserAndRecordDateBetween도 LocalDateTime으로 변경
    List<Record> findByUserAndRecordDateBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
}

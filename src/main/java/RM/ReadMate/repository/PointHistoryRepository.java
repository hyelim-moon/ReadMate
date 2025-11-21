package RM.ReadMate.repository;

import RM.ReadMate.entity.PointHistory;
import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    List<PointHistory> findByUserOrderByTransactionDateDesc(User user);
}

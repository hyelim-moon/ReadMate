package RM.ReadMate.repository;

import RM.ReadMate.entity.Record;
import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {

    List<Record> findByUser(User user);

    @Query("SELECT r FROM Record r JOIN FETCH r.user WHERE r.id = :id")
    Record findByIdWithUser(@Param("id") Long id);
}

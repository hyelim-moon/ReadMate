package RM.ReadMate.repository;

import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findTop10ByOrderByPointsDesc();
    Optional<User> findByUserid(String userid);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}

package RM.ReadMate.repository;

import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAllByOrderByPointsDesc();
}

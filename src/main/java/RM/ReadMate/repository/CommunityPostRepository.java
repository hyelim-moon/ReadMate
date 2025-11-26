package RM.ReadMate.repository;

import RM.ReadMate.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @Query("SELECT p FROM CommunityPost p " +
            "WHERE (:keyword IS NULL OR :keyword = '' " +
            "   OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "       OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "       OR (p.tags IS NOT NULL AND LOWER(p.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
            "AND (:start IS NULL OR p.createdAt >= :start) " +
            "AND (:end IS NULL OR p.createdAt <= :end) " +
            "ORDER BY p.createdAt DESC")
    List<CommunityPost> searchPosts(
            @Param("keyword") String keyword,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );


}

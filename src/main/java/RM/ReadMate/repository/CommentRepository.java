package RM.ReadMate.repository;

import RM.ReadMate.entity.Comment;
import RM.ReadMate.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    List<Comment> findByParentId(Long parentId);
    /*List<Comment> findByPostId(Long postId);*/
}

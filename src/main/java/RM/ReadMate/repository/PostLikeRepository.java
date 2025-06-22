package RM.ReadMate.repository;

import RM.ReadMate.entity.PostLike;
import RM.ReadMate.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {

    Optional<PostLike> findById(PostLikeId id);

    boolean existsById(PostLikeId id);

    void deleteById(PostLikeId id);
}

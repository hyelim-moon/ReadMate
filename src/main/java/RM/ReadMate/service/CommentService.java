package RM.ReadMate.service;

import RM.ReadMate.dto.CommentDto;
import RM.ReadMate.entity.Comment;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.repository.CommentRepository;
import RM.ReadMate.repository.CommunityPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommunityPostRepository postRepository;

    public CommentService(CommentRepository commentRepository,
                          CommunityPostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long postId, String userId, String content) {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthorId(userId);
        comment.setContent(content);
        commentRepository.save(comment);
        return toDto(comment);
    }

    @Transactional
    public CommentDto updateComment(Long commentId, String userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
        if (!comment.getAuthorId().equals(userId)) {
            throw new IllegalArgumentException("본인 댓글만 수정할 수 있습니다.");
        }
        comment.setContent(content);
        return toDto(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
        CommunityPost post = comment.getPost();
        boolean isPostOwner = post.getAuthorId().equals(userId);
        boolean isCommentOwner = comment.getAuthorId().equals(userId);
        if (!(isPostOwner || isCommentOwner)) {
            throw new IllegalArgumentException("댓글 삭제 권한이 없습니다.");
        }
        commentRepository.delete(comment);
    }

    private CommentDto toDto(Comment comment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return new CommentDto(
                comment.getId(),
                comment.getContent(),
                comment.getAuthorId(),
                comment.getCreatedAt().format(formatter)
        );
    }
}

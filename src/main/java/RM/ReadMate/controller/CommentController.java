package RM.ReadMate.controller;

import RM.ReadMate.dto.CommentDto;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.repository.CommunityPostRepository;
import RM.ReadMate.service.CommentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/{postId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final CommunityPostRepository postRepository;

    public CommentController(CommentService commentService,
                             CommunityPostRepository postRepository) {
        this.commentService = commentService;
        this.postRepository = postRepository;
    }

    @GetMapping
    public List<CommentDto> getComments(@PathVariable Long postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PostMapping
    public CommentDto addComment(@PathVariable Long postId,
                                 @AuthenticationPrincipal UserDetails user,
                                 @RequestBody CommentDto commentDto) {
        return commentService.addComment(postId, user.getUsername(), commentDto.getContent(), commentDto.getParentId());
    }

    @PutMapping("/{commentId}")
    public CommentDto updateComment(@PathVariable Long commentId,
                                    @AuthenticationPrincipal UserDetails user,
                                    @RequestBody CommentDto commentDto) {
        return commentService.updateComment(commentId, user.getUsername(), commentDto.getContent());
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId,
                              @AuthenticationPrincipal UserDetails user) {
        commentService.deleteComment(commentId, user.getUsername());
    }
}

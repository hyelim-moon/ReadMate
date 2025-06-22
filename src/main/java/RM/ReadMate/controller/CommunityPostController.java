package RM.ReadMate.controller;

import RM.ReadMate.dto.CommunityPostDto;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.service.CommunityPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunityPostController {

    private final CommunityPostService postService;

    public CommunityPostController(CommunityPostService postService) {
        this.postService = postService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("tags") String tags,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            String username = userDetails.getUsername();
            CommunityPost saved = postService.savePost(title, content, tags, imageFile, username);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("게시글 등록 실패: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CommunityPostDto>> getAllPosts() {
        List<CommunityPostDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = (userDetails != null) ? userDetails.getUsername() : null;
            CommunityPostDto postDto = postService.getPostDtoById(id, username);
            return ResponseEntity.ok(postDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("tags") String tags,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String username = userDetails.getUsername();

        try {
            CommunityPostDto updatedPost = postService.updatePost(id, title, content, tags, imageFile, username);
            if (updatedPost == null) {
                return ResponseEntity.status(403).body("수정 권한이 없습니다.");
            }
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("게시글 수정 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String username = userDetails.getUsername();
        try {
            boolean deleted = postService.deletePost(id, username);
            if (deleted) {
                return ResponseEntity.ok("삭제 성공");
            } else {
                return ResponseEntity.status(403).body("삭제 권한이 없습니다.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("삭제 실패: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        String username = userDetails.getUsername();
        try {
            boolean liked = postService.toggleLike(id, username);
            return ResponseEntity.ok().body(liked);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("좋아요 처리 실패: " + e.getMessage());
        }
    }
}

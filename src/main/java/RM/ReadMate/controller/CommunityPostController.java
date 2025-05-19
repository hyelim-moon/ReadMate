package RM.ReadMate.controller;

import RM.ReadMate.dto.CommunityPostDto;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.service.CommunityPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class CommunityPostController {

    private final CommunityPostService postService;

    @Autowired
    public CommunityPostController(CommunityPostService postService) {
        this.postService = postService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("tags") String tags,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            CommunityPost saved = postService.savePost(title, content, tags, imageFile);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("게시글 등록 실패: " + e.getMessage());
        }
    }

/*    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        System.out.println("GET /api/community 요청 받음");
        try {
            return ResponseEntity.ok(postService.getAllPosts());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("게시글 조회 실패: " + e.getMessage());
        }
    }*/
    @GetMapping
    public ResponseEntity<List<CommunityPostDto>> getAllPosts() {
        List<CommunityPostDto> posts = postService.getAllPosts();  // DTO 리스트 받음
        return ResponseEntity.ok(posts);
    }

}

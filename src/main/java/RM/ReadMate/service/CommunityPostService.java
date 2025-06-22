package RM.ReadMate.service;

import RM.ReadMate.dto.CommunityPostDto;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.entity.PostLike;
import RM.ReadMate.entity.PostLikeId;
import RM.ReadMate.repository.CommunityPostRepository;
import RM.ReadMate.repository.PostLikeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CommunityPostService {

    private final CommunityPostRepository postRepository;
    private final PostLikeRepository postLikeRepository;

    @Value("${spring.file.upload-dir}")
    private String uploadDir;

    public CommunityPostService(CommunityPostRepository postRepository,
                                PostLikeRepository postLikeRepository) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
    }

    public CommunityPost savePost(String title, String content, String tags, MultipartFile imageFile) throws Exception {
        String imagePath = null;

        if (imageFile != null && !imageFile.isEmpty()) {
            String rootPath = System.getProperty("user.dir");
            File dir = new File(rootPath, uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, fileName);

            imageFile.transferTo(dest);

            imagePath = "/uploads/" + fileName;
        }

        CommunityPost post = new CommunityPost();
        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);
        post.setImagePath(imagePath);
        post.setLikes(0); // 기본 0 설정 필요

        return postRepository.save(post);
    }

    public List<CommunityPostDto> getAllPosts() {
        List<CommunityPost> posts = postRepository.findAll();
        List<CommunityPostDto> result = new ArrayList<>();

        for (CommunityPost post : posts) {
            String timeAgo = calculateTimeAgo(post.getCreatedAt());

            CommunityPostDto dto = new CommunityPostDto(
                    post.getId(),
                    post.getTitle(),
                    post.getContent(),
                    post.getTags(),
                    post.getImagePath(),
                    post.getLikes(),
                    false,  // 전체 목록에서는 liked 정보 없으므로 false 기본값
                    timeAgo,
                    post.getCreatedAt()
            );

            result.add(dto);
        }

        return result;
    }

    // 게시글 상세 조회 + 로그인 사용자 기준 좋아요 여부 반환
    public CommunityPostDto getPostDtoById(Long postId, String username) throws Exception {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("게시글이 존재하지 않습니다."));

        boolean liked = false;
        if (username != null) {
            PostLikeId likeId = new PostLikeId(postId, username);
            liked = postLikeRepository.findById(likeId).isPresent();
        }

        String timeAgo = calculateTimeAgo(post.getCreatedAt());

        return new CommunityPostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getTags(),
                post.getImagePath(),
                post.getLikes(),
                liked,
                timeAgo,
                post.getCreatedAt()
        );
    }

    // 좋아요 토글 처리 메서드
    public boolean toggleLike(Long postId, String username) throws Exception {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("게시글이 존재하지 않습니다."));

        PostLikeId likeId = new PostLikeId(postId, username);
        Optional optionalLike = postLikeRepository.findById(likeId);

        if (optionalLike.isPresent()) {
            // 좋아요 취소
            postLikeRepository.delete((PostLike) optionalLike.get());
            post.setLikes(post.getLikes() - 1);
            postRepository.save(post);
            return false;
        } else {
            // 좋아요 추가
            PostLike newLike = new PostLike(post, username);
            postLikeRepository.save(newLike);
            post.setLikes(post.getLikes() + 1);
            postRepository.save(post);
            return true;
        }
    }

    private String calculateTimeAgo(LocalDateTime createdAt) {
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long minutes = duration.toMinutes();

        if (minutes < 1) return "방금 전";
        else if (minutes < 60) return minutes + "분 전";
        else if (minutes < 1440) return (minutes / 60) + "시간 전";
        else return (minutes / 1440) + "일 전";
    }
}

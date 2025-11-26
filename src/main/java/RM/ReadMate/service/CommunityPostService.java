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
import java.time.LocalDate;
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

    public CommunityPost savePost(String title, String content, String tags, MultipartFile imageFile, String authorId) throws Exception {
        String imagePath = saveImageFile(imageFile);

        CommunityPost post = new CommunityPost();
        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);
        post.setImagePath(imagePath);
        post.setLikes(0);
        post.setAuthorId(authorId);

        return postRepository.save(post);
    }

    public CommunityPostDto updatePost(Long postId, String title, String content, String tags, MultipartFile imageFile, String username) throws Exception {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("게시글이 존재하지 않습니다."));

        if (!post.getAuthorId().equals(username)) {
            return null;
        }

        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);

        if (imageFile != null && !imageFile.isEmpty()) {
            post.setImagePath(saveImageFile(imageFile));
        }

        CommunityPost updated = postRepository.save(post);

        String timeAgo = calculateTimeAgo(updated.getCreatedAt());

        return new CommunityPostDto(
                updated.getId(),
                updated.getTitle(),
                updated.getContent(),
                updated.getTags(),
                updated.getImagePath(),
                updated.getLikes(),
                false,
                timeAgo,
                updated.getCreatedAt(),
                updated.getAuthorId()
        );
    }

    private String saveImageFile(MultipartFile imageFile) throws Exception {
        if (imageFile == null || imageFile.isEmpty()) {
            return null;
        }

        String rootPath = System.getProperty("user.dir");
        File dir = new File(rootPath, uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
        File dest = new File(dir, fileName);
        imageFile.transferTo(dest);

        return "/uploads/" + fileName;
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
                    false,
                    timeAgo,
                    post.getCreatedAt(),
                    post.getAuthorId()
            );

            result.add(dto);
        }

        return result;
    }

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
                post.getCreatedAt(),
                post.getAuthorId()
        );
    }

    public boolean toggleLike(Long postId, String username) throws Exception {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("게시글이 존재하지 않습니다."));

        PostLikeId likeId = new PostLikeId(postId, username);
        Optional<PostLike> optionalLike = postLikeRepository.findById(likeId);

        if (optionalLike.isPresent()) {
            postLikeRepository.delete(optionalLike.get());
            post.setLikes(post.getLikes() - 1);
            postRepository.save(post);
            return false;
        } else {
            PostLike newLike = new PostLike(post, username);
            postLikeRepository.save(newLike);
            post.setLikes(post.getLikes() + 1);
            postRepository.save(post);
            return true;
        }
    }

    public boolean deletePost(Long postId, String username) throws Exception {
        CommunityPost post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("게시글이 존재하지 않습니다."));

        if (!post.getAuthorId().equals(username)) {
            return false;
        }

        postRepository.delete(post);
        return true;
    }

    private String calculateTimeAgo(LocalDateTime createdAt) {
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long minutes = duration.toMinutes();

        if (minutes < 1) return "방금 전";
        else if (minutes < 60) return minutes + "분 전";
        else if (minutes < 1440) return (minutes / 60) + "시간 전";
        else return (minutes / 1440) + "일 전";
    }

    // ✅ 수정된 searchPosts 메서드
    public List<CommunityPostDto> searchPosts(String keyword, String startDate, String endDate) {
        LocalDateTime start = null;
        LocalDateTime end = null;

        try {
            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDate.parse(startDate).atStartOfDay();
            }
            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDate.parse(endDate).atTime(23, 59, 59);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        List<CommunityPost> posts = postRepository.searchPosts(keyword, start, end);
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
                    false,
                    timeAgo,
                    post.getCreatedAt(),
                    post.getAuthorId()
            );
            result.add(dto);
        }

        return result;
    }
}

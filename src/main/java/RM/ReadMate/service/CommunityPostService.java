package RM.ReadMate.service;

import RM.ReadMate.dto.CommunityPostDto;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.repository.CommunityPostRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CommunityPostService {

    private final CommunityPostRepository postRepository;

    @Value("${spring.file.upload-dir}")
    private String uploadDir;

    public CommunityPostService(CommunityPostRepository postRepository) {
        this.postRepository = postRepository;
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

        System.out.println("createdAt before save: " + post.getCreatedAt());

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
                    timeAgo,
                    post.getCreatedAt()  // 실제 날짜도 전달
            );

            result.add(dto);
        }

        return result;
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

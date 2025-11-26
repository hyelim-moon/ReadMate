package RM.ReadMate.controller;

import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.CommunityPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SearchController {

    private final BookRepository bookRepository;
    private final CommunityPostRepository communityPostRepository;

    @GetMapping("/search")
    public Map<String, Object> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category
    ) {

        System.out.println("검색 키워드: " + keyword);
        System.out.println("검색 카테고리: " + category);

        List<Book> books;

        // 🔥 keyword 없으면 빈 배열 반환
        if (keyword == null || keyword.isBlank()) {
            books = List.of();
        } else {
            // 🔥 카테고리별 검색
            if (category == null || category.equals("전체")) {
                books = bookRepository.searchByKeyword(keyword);
            } else {
                switch (category) {
                    case "제목":
                        books = bookRepository.findByBookNameContainingIgnoreCase(keyword);
                        break;
                    case "저자":
                        books = bookRepository.findByAuthorContainingIgnoreCase(keyword);
                        break;
                    case "출판사":
                        books = bookRepository.findByPublisherContainingIgnoreCase(keyword);
                        break;
                    default:
                        books = bookRepository.searchByKeyword(keyword); // fallback
                }
            }
        }

        // 🔥 커뮤니티 검색 (카테고리 무관)
        List<CommunityPost> posts = communityPostRepository.searchPosts(keyword, null, null);

        System.out.println("검색된 책 개수 = " + books.size());
        books.forEach(b -> System.out.println("책: " + b.getBookName()));

        Map<String, Object> result = new HashMap<>();
        result.put("books", books);
        result.put("posts", posts);
        return result;
    }
}

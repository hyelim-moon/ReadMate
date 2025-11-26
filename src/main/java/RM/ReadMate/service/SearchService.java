package RM.ReadMate.service;

import RM.ReadMate.dto.SearchResponseDTO;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.CommunityPost;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.CommunityPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final BookRepository bookRepository;
    private final CommunityPostRepository communityPostRepository;

    public SearchResponseDTO search(String keyword) {

        // 책 검색 (bookName 기준)
        List<Book> books = bookRepository.searchByKeyword(keyword);

        // 커뮤니티 검색 (이미 완성된 searchPosts 사용)
        List<CommunityPost> posts = communityPostRepository.searchPosts(
                keyword,
                null,
                null
        );

        return new SearchResponseDTO(books, posts);
    }
}

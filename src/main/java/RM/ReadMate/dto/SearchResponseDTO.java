package RM.ReadMate.dto;

import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.CommunityPost;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SearchResponseDTO {
    private List<Book> books;
    private List<CommunityPost> posts;
}

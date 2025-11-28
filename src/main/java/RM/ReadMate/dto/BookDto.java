package RM.ReadMate.dto;

import RM.ReadMate.entity.Book;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDto {

    private Long id;
    private String isbn;
    private String bookName;
    private String author;
    private String publisher;
    private String genre;
    private String content;
    private String bookImage;
    private int pageCount;
    private String uploaderNickname; // ✅ 등록자 닉네임
    private List<ReviewDto> reviews; // ✅ 리뷰 목록 추가

    // Book → BookDto 변환 생성자
    public BookDto(Book book) {
        this.id = book.getId();
        this.isbn = book.getIsbn();
        this.bookName = book.getBookName();
        this.author = book.getAuthor();
        this.publisher = book.getPublisher();
        this.genre = book.getGenre();
        this.content = book.getContent();
        this.bookImage = book.getBookImage();
        this.pageCount = book.getPageCount();
        this.uploaderNickname = (book.getUser() != null) ? book.getUser().getNickname() : null;
        if (book.getReviews() != null) {
            this.reviews = book.getReviews().stream().map(ReviewDto::new).collect(Collectors.toList());
        }
    }

    // ✅ 정적 메서드 추가: Book → BookDto 변환
    public static BookDto fromEntity(Book book) {
        List<ReviewDto> reviewDtos = null;
        if (book.getReviews() != null) {
            reviewDtos = book.getReviews().stream().map(ReviewDto::new).collect(Collectors.toList());
        }
        return BookDto.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .bookName(book.getBookName())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .genre(book.getGenre())
                .content(book.getContent())
                .bookImage(book.getBookImage())
                .pageCount(book.getPageCount())
                .uploaderNickname(book.getUser() != null ? book.getUser().getNickname() : null)
                .reviews(reviewDtos)
                .build();
    }

    // BookDto → Book 엔티티 변환 (User는 외부에서 주입)
    public Book toEntity(RM.ReadMate.entity.User user) {
        return Book.builder()
                .isbn(isbn)
                .bookName(bookName)
                .author(author)
                .publisher(publisher)
                .genre(genre)
                .content(content)
                .bookImage(bookImage)
                .pageCount(pageCount)
                .user(user)
                .build();
    }
}
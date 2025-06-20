package RM.ReadMate.dto;

import RM.ReadMate.entity.SavedBook;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class SavedBookDTO {

    private Long id;
    private String bookTitle;    // 책 제목
    private String bookAuthor;   // 책 저자
    private String bookPublisher; // 책 출판사
    private String bookGenre;    // 책 장르
    private String bookImage;    // 책 이미지 URL
    private int progress;        // 읽기 진행률
    private LocalDate startedAt; // 읽기 시작 날짜
    private LocalDate finishedAt; // 읽기 완료 날짜
    private LocalDate savedAt;   // 저장 날짜

    // 생성자에서 필요한 정보를 DTO로 변환
    public SavedBookDTO(SavedBook savedBook) {
        this.id = savedBook.getId();
        this.bookTitle = savedBook.getBook().getBookName();
        this.bookAuthor = savedBook.getBook().getAuthor();
        this.bookPublisher = savedBook.getBook().getPublisher();
        this.bookGenre = savedBook.getBook().getGenre();
        this.bookImage = savedBook.getBook().getBookImage();
        this.progress = savedBook.getProgress();
        this.startedAt = savedBook.getStartedAt();
        this.finishedAt = savedBook.getFinishedAt();
        this.savedAt = savedBook.getSavedAt();
    }
}

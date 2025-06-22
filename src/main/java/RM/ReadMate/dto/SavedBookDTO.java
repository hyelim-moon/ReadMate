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
    private int currentPage; // 현재 읽고 있는 페이지
    private int totalPages;  // 총 페이지 수
    private LocalDate startedAt; // 읽기 시작 날짜
    private LocalDate finishedAt; // 읽기 완료 날짜
    private LocalDate savedAt;   // 저장 날짜
    private String content;      // 책 소개

    // 생성자에서 필요한 정보를 DTO로 변환
    public SavedBookDTO(SavedBook savedBook) {
        this.id = savedBook.getId();
        this.bookTitle = savedBook.getBook().getBookName();
        this.bookAuthor = savedBook.getBook().getAuthor();
        this.bookPublisher = savedBook.getBook().getPublisher();
        this.bookGenre = savedBook.getBook().getGenre();
        this.bookImage = savedBook.getBook().getBookImage();
        this.currentPage = savedBook.getCurrentPage();
        this.totalPages = savedBook.getTotalPages();
        this.startedAt = savedBook.getStartedAt();
        this.finishedAt = savedBook.getFinishedAt();
        this.savedAt = savedBook.getSavedAt();
        this.content = savedBook.getBook().getContent();

        // `progress` 계산: (현재 페이지 / 총 페이지) * 100
        int currentPage = savedBook.getCurrentPage();   // 현재 페이지
        int totalPages = savedBook.getTotalPages();     // 총 페이지

        if (totalPages > 0) {
            this.progress = (int) ((double) currentPage / totalPages * 100);
        } else {
            this.progress = 0; // 페이지 수가 없을 경우 진행률을 0%로 설정
        }
    }
}

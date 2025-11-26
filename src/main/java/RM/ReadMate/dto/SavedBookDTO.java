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
    private String bookTitle;
    private String bookAuthor;
    private String bookPublisher;
    private String bookGenre;
    private String bookImage;
    private int progress;
    private int currentPage;
    private int totalPages;
    private LocalDate startedAt;
    private LocalDate finishedAt;
    private LocalDate savedAt;
    private String content;
    private Integer score;
    private Integer wishScore;

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
        this.score = savedBook.getScore();
        this.wishScore = savedBook.getWishScore();

        if (this.totalPages > 0) {
            this.progress = (int) ((double) this.currentPage / this.totalPages * 100);
        } else {
            this.progress = 0;
        }
    }
}

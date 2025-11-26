package RM.ReadMate.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SavedBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private int currentPage = 0;

    @Column(nullable = false)
    private int totalPages;

    private LocalDate startedAt;

    private LocalDate finishedAt;

    private LocalDate savedAt;

    private Integer score; // 별점 (1~5)

    private Integer wishScore; // 읽고 싶은 마음 (1~5)

    public SavedBook(User user, Book book) {
        this.user = user;
        this.book = book;
        this.totalPages = book.getPageCount();
        this.savedAt = LocalDate.now();
    }
}

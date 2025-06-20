package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "saved_books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int currentPage;     // 현재 읽고 있는 페이지
    private int totalPages;      // 총 페이지 수
    private LocalDate startedAt; // 읽기 시작 날짜
    private LocalDate finishedAt; // 읽기 완료 날짜
    private LocalDate savedAt;   // 저장 날짜

}

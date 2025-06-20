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

    // 저장한 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 저장된 책
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private LocalDate startedAt;  // 읽기 시작 날짜

    private LocalDate finishedAt; // 읽기 완료 날짜

    private int progress; // 읽기 진행률 (예: 0~100)

    private LocalDate savedAt; // 저장 날짜
}

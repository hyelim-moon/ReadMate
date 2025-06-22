package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String isbn; // ISBN 번호

    @Column(nullable = false)
    private String bookName; // 책 제목

    @Column
    private String author; // 저자

    @Column(nullable = false)
    private String publisher; // 출판사

    private String genre; // 장르

    @Column(columnDefinition = "TEXT")
    private String content; // 책 요약

    private String bookImage; // 책 이미지 URL

    private int pageCount; // 페이지 수

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 등록한 사용자
}

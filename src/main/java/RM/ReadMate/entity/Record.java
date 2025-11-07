package RM.ReadMate.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Record {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // 책 제목은 필수 입력
    private String title;

    @Column(nullable = false) // 저자도 필수 입력
    private String author;

    @Column(nullable = true)
    private String publisher;

    @Column(nullable = true)
    private String genre;

    @Column(columnDefinition = "TEXT") // 긴 텍스트 저장을 위한 TEXT 타입
    private String content;

    @Column(nullable = true)
    private String photo; // 사진은 null 가능

    @Column(nullable = true) // null 허용으로 변경
    private LocalDate recordDate; // 독서 기록 날짜

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"records", "savedBooks"}) // 순환 참조 방지
    private User user;
}

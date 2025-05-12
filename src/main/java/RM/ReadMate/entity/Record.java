package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.*;

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

    private String title;
    private String author;
    private String publisher;
    private String genre;
    private String review;

    @Column(nullable = true)
    private String photo; // 사진은 null 가능

    @Column(name = "user_id", nullable = true) // 비회원도 저장 가능
    private Long userId;
}

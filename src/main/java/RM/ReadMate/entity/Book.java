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
    private Long id;  // 내부 DB용 PK

    @Column(unique = true)
    private String isbn;  // 실제 ISBN (13자리 문자열)

    @Column(nullable = false)
    private String bookName;

    @Column
    private String bookImage;  // 이미지 URL 저장이라면 이대로 OK

    @Column
    private String bookDescription;

    @Column
    private String genre;

    @Column
    private String publisher;
}
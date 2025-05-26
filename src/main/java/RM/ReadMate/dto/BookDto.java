package RM.ReadMate.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDto {
    private int id;
    private String isbn;
    private String bookName;
    private String bookImage;
    private String bookDescription;
    private String genre;
    private String publisher;
}

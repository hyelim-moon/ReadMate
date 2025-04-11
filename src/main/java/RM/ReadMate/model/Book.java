package RM.ReadMate.model;

public class Book {
    private Long id;
    private String title;
    private String author;
    private String coverImage;

    public Book(Long id, String title, String author, String coverImage) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.coverImage = coverImage;
    }
}

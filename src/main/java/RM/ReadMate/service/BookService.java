package RM.ReadMate.service;

import RM.ReadMate.model.Book;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class BookService {
    private final List<Book> books = Arrays.asList(
            new Book(1L, "작별인사", "김영하", "/images/book1.jpg"),
            new Book(2L, "불편한 편의점", "김호연", "/images/book2.jpg"),
            new Book(3L, "완전한 행복", "정유정", "/images/book3.jpg")
    );

    public List<Book> getRecommendedBooks() {
        return books;
    }

    public Book getRandomRecommendation() {
        Random rand = new Random();
        return books.get(rand.nextInt(books.size()));
    }
}

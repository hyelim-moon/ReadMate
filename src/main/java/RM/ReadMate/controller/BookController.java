package RM.ReadMate.controller;

import RM.ReadMate.model.Book;
import RM.ReadMate.service.BookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookController {
    private final BookService bookService;
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books/recommend")
    public List<Book> getRecommendations() {
        return bookService.getRecommendedBooks();
    }

    @GetMapping("/recommend")
    public Book recommendRandomBook() {
        return bookService.getRandomRecommendation();
    }
}

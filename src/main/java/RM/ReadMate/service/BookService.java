package RM.ReadMate.service;

import RM.ReadMate.entity.Book;
import RM.ReadMate.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public Book save(Book book) {
        return bookRepository.save(book);
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Optional<Book> findByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn);
    }

    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    public void deleteById(Long id) {
        bookRepository.deleteById(id);
    }
}

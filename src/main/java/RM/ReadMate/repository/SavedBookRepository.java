package RM.ReadMate.repository;

import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.SavedBook;
import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedBookRepository extends JpaRepository<SavedBook, Long> {
    Optional<SavedBook> findByUserAndBook(User user, Book book);
    boolean existsByUserAndBook(User user, Book book);
    List<SavedBook> findByUser(User user);
}

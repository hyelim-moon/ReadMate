package RM.ReadMate.controller;

import RM.ReadMate.dto.SavedBookDTO;
import RM.ReadMate.dto.SavedBookUpdateDTO;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.SavedBook;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.SavedBookRepository;
import RM.ReadMate.repository.UserRepository;
import RM.ReadMate.service.SavedBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-books")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SavedBookController {

    private final SavedBookRepository savedBookRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final SavedBookService savedBookService;

    @PostMapping("/{bookId}")
    public ResponseEntity<?> saveBook(@PathVariable Long bookId, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (savedBookRepository.existsByUserAndBook(user, book)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 저장된 책입니다.");
        }

        SavedBook savedBook = new SavedBook(user, book);
        savedBookRepository.save(savedBook);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{bookId}")
    public ResponseEntity<?> removeBook(@PathVariable Long bookId, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        SavedBook savedBook = savedBookRepository.findByUserAndBook(user, book)
                .orElseThrow(() -> new RuntimeException("저장된 책이 아닙니다."));

        savedBookRepository.delete(savedBook);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBook(@RequestParam Long bookId, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        boolean isSaved = savedBookRepository.existsByUserAndBook(user, book);
        return ResponseEntity.ok(isSaved);
    }

    @GetMapping
    public ResponseEntity<List<SavedBookDTO>> getSavedBooks(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        List<SavedBookDTO> savedBookDTOs = savedBookService.getSavedBooksByUser(user.getUserid());
        return ResponseEntity.ok(savedBookDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedBookDTO> getSavedBook(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        SavedBookDTO savedBookDTO = savedBookService.getSavedBookById(id, user.getId());
        return ResponseEntity.ok(savedBookDTO);
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<SavedBookDTO> updateSavedBook(@PathVariable Long id, @RequestBody SavedBookUpdateDTO updateDTO, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        SavedBookDTO updatedSavedBook = savedBookService.updateSavedBook(id, user.getId(), updateDTO);
        return ResponseEntity.ok(updatedSavedBook);
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String userId = authentication.getName();
        return userRepository.findByUserid(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

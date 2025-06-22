package RM.ReadMate.controller;

import RM.ReadMate.dto.SavedBookDTO;
import RM.ReadMate.entity.SavedBook;
import RM.ReadMate.service.SavedBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-books")
public class SavedBookController {

    private final SavedBookService savedBookService;

    @Autowired
    public SavedBookController(SavedBookService savedBookService) {
        this.savedBookService = savedBookService;
    }

    // 사용자별 저장된 책 목록 조회 (userid로 찾은 후)
    @GetMapping("/by-user/{userid}")
    public List<SavedBookDTO> getSavedBooksByUser(@PathVariable String userid) {
        return savedBookService.getSavedBooksByUser(userid);
    }

    // 책 저장
    @PostMapping("/save/{userId}")
    public SavedBookDTO saveBookForUser(@PathVariable Long userId, @RequestBody SavedBook savedBook) {
        // 저장된 책을 DTO로 변환하여 반환
        SavedBook saved = savedBookService.saveBookForUser(userId, savedBook);
        return new SavedBookDTO(saved);
    }

    // 책 삭제
    @DeleteMapping("/{savedBookId}")
    public ResponseEntity<String> deleteSavedBook(@PathVariable Long savedBookId) {
        try {
            savedBookService.deleteSavedBook(savedBookId);
            return ResponseEntity.ok("책이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("삭제 중 오류가 발생했습니다.");
        }
    }

}


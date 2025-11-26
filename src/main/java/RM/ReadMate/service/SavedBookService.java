package RM.ReadMate.service;

import RM.ReadMate.dto.SavedBookDTO;
import RM.ReadMate.dto.SavedBookUpdateDTO;
import RM.ReadMate.entity.SavedBook;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.SavedBookRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedBookService {

    private final SavedBookRepository savedBookRepository;
    private final UserRepository userRepository;

    public List<SavedBookDTO> getSavedBooksByUser(String userid) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<SavedBook> savedBooks = savedBookRepository.findByUser(user);

        return savedBooks.stream()
                .map(SavedBookDTO::new)
                .collect(Collectors.toList());
    }

    public SavedBookDTO getSavedBookById(Long savedBookId, Long userId) {
        SavedBook savedBook = savedBookRepository.findById(savedBookId)
                .orElseThrow(() -> new RuntimeException("저장된 책을 찾을 수 없습니다."));

        if (!savedBook.getUser().getId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        return new SavedBookDTO(savedBook);
    }

    @Transactional
    public SavedBookDTO updateSavedBook(Long savedBookId, Long userId, SavedBookUpdateDTO updateDTO) {
        SavedBook savedBook = savedBookRepository.findById(savedBookId)
                .orElseThrow(() -> new RuntimeException("저장된 책을 찾을 수 없습니다."));

        if (!savedBook.getUser().getId().equals(userId)) {
            throw new SecurityException("권한이 없습니다.");
        }

        savedBook.setCurrentPage(updateDTO.getCurrentPage());
        savedBook.setStartedAt(updateDTO.getStartedAt());
        savedBook.setFinishedAt(updateDTO.getFinishedAt());
        savedBook.setScore(updateDTO.getScore());
        savedBook.setWishScore(updateDTO.getWishScore());

        SavedBook updatedSavedBook = savedBookRepository.save(savedBook);
        return new SavedBookDTO(updatedSavedBook);
    }

    public SavedBook saveBookForUser(Long userId, SavedBook savedBook) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        savedBook.setUser(user);
        return savedBookRepository.save(savedBook);
    }

    public void deleteSavedBook(Long savedBookId) {
        savedBookRepository.deleteById(savedBookId);
    }
}

package RM.ReadMate.service;

import RM.ReadMate.dto.SavedBookDTO;
import RM.ReadMate.entity.SavedBook;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.SavedBookRepository;
import RM.ReadMate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavedBookService {

    private final SavedBookRepository savedBookRepository;
    private final UserRepository userRepository;

    @Autowired
    public SavedBookService(SavedBookRepository savedBookRepository, UserRepository userRepository) {
        this.savedBookRepository = savedBookRepository;
        this.userRepository = userRepository;
    }

    // 사용자별 저장된 책 목록 조회 (userid로 찾은 후)
    public List<SavedBookDTO> getSavedBooksByUser(String userid) {
        // 1. userid로 User를 찾음
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 2. user.id로 SavedBook 리스트 조회
        List<SavedBook> savedBooks = savedBookRepository.findByUserId(user.getId());

        // 3. SavedBook 엔티티 리스트를 SavedBookDTO 리스트로 변환하여 반환
        return savedBooks.stream()
                .map(SavedBookDTO::new) // SavedBook을 SavedBookDTO로 변환
                .collect(Collectors.toList());
    }

    // 책 저장
    public SavedBook saveBookForUser(Long userId, SavedBook savedBook) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 사용자 설정 후 저장
        savedBook.setUser(user);
        return savedBookRepository.save(savedBook);
    }

    // 책 삭제
    public void deleteSavedBook(Long savedBookId) {
        savedBookRepository.deleteById(savedBookId);
    }
}

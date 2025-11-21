package RM.ReadMate.repository;

import RM.ReadMate.entity.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    Optional<Book> findFirstByBookNameOrderByIdDesc(String bookName);

    /** 장르별 조회 (기존 서비스 사용) */
    List<Book> findByGenre(String genre);

    /**
     * ✅ ‘미분류’/‘기타’ 포함한 미분류 목록 페이지네이션
     * 파생 메서드명이 규칙에 맞지 않으므로 @Query로 명시합니다.
     */
    @Query("select b " +
            "from Book b " +
            "where (b.genre is null or b.genre = '' or b.genre = '미분류' or b.genre = '기타') " +
            "order by b.id asc")
    List<Book> findUnclassified(Pageable pageable);

    @Query("select b " +
            "from Book b " +
            "where (b.genre is null or b.genre = '' or b.genre = '미분류' or b.genre = '기타') " +
            "   or (b.content is null or b.content = '') " +
            "   or (b.pageCount <= 0) " +
            "order by b.id asc")
    List<Book> findNeedEnrichmentAll();
}

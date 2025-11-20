package RM.ReadMate.repository;

import RM.ReadMate.entity.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    // 기존 서비스에서 쓰고 있는 메서드들 유지
    Optional<Book> findByIsbn(String isbn);

    Optional<Book> findFirstByBookNameOrderByIdDesc(String bookName);

    List<Book> findByGenre(String genre);

    // 장르 백필용: 미분류/빈값만 페이징으로 가져오기
    @Query("""
           select b
           from Book b
           where (b.genre is null or b.genre = '' or b.genre = '미분류')
           order by b.id asc
           """)
    List<Book> findUnclassified(Pageable pageable);

    // ✅ 새로 추가: 장르/내용/페이지수 중 하나라도 비어 있는 책 전체 조회
    @Query("""
           select b
           from Book b
           where
             (b.genre is null or b.genre = '' or b.genre = '미분류')
             or (b.content is null or b.content = '')
             or (b.pageCount <= 0)
           order by b.id asc
           """)
    List<Book> findNeedEnrichmentAll();
}

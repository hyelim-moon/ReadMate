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
}

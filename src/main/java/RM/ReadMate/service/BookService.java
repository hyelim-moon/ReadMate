package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.BookRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final String GOOGLE_BOOKS_API_KEY = "AIzaSyD8CJbNQX3AialFRwia9TcwPqDY1fWuPjU";

    // ✅ 사용자 정보 포함 저장
    public Book save(Book book, String userid) {
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new IllegalArgumentException("등록자 정보를 찾을 수 없습니다."));
        book.setUser(user);
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

    // ✅ API로부터 책 정보 가져오기 및 저장
    public BookDto fetchBookFromApis(String title) {
        // 1. DB에 제목 기준 조회
        Optional<Book> existingBook = bookRepository.findByBookName(title);
        if (existingBook.isPresent()) {
            System.out.println("✅ DB에서 조회된 책 데이터: " + existingBook.get());
            return new BookDto(existingBook.get());
        }

        try {
            // 2. Google API에서 책 정보 요청
            BookDto dto = fetchBookByTitleFromGoogleBooks(title);

            // 3. ISBN 중복 확인
            Optional<Book> existingByIsbn = bookRepository.findByIsbn(dto.getIsbn());
            if (existingByIsbn.isPresent()) {
                System.out.println("✅ ISBN 중복으로 저장 생략: " + dto.getIsbn());
                return new BookDto(existingByIsbn.get());
            }

            // 4. DB 저장
            Book bookEntity = dto.toEntity(null); // uploader(user)는 null로 저장
            bookRepository.save(bookEntity);
            System.out.println("🔍 API로부터 가져와 DB에 저장한 책 데이터: " + dto);

            return dto;

        } catch (Exception e) {
            System.err.println("❌ 데이터 불러오는 중 오류 발생: " + e.getMessage());
            return null;
        }
    }

    // ✅ Google Books API로부터 책 데이터 가져오기
    private BookDto fetchBookByTitleFromGoogleBooks(String title) throws Exception {
        String apiUrl = "https://www.googleapis.com/books/v1/volumes?q=" + URLEncoder.encode(title, "UTF-8")
                + "&key=" + GOOGLE_BOOKS_API_KEY;

        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String inputLine;
        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        JSONObject json = new JSONObject(response.toString());
        JSONArray items = json.getJSONArray("items");
        JSONObject volumeInfo = items.getJSONObject(0).getJSONObject("volumeInfo");

        return BookDto.builder()
                .isbn(volumeInfo.has("industryIdentifiers")
                        ? volumeInfo.getJSONArray("industryIdentifiers").getJSONObject(0).optString("identifier")
                        : "")
                .bookName(volumeInfo.optString("title"))
                .author(volumeInfo.has("authors") ? volumeInfo.getJSONArray("authors").optString(0) : "")
                .publisher(volumeInfo.optString("publisher", ""))
                .genre(volumeInfo.has("categories") ? volumeInfo.getJSONArray("categories").optString(0) : "")
                .content(volumeInfo.optString("description", ""))
                .bookImage(volumeInfo.has("imageLinks")
                        ? volumeInfo.getJSONObject("imageLinks").optString("thumbnail")
                        : "")
                .pageCount(volumeInfo.optInt("pageCount", 0))
                .build();
    }

    // ✅ 필요 시 수동 변환용 메서드 (생성자 대신)
    public BookDto convertToDto(Book book) {
        return new BookDto(book);
    }
}

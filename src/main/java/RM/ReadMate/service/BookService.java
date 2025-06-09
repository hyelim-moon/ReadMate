package RM.ReadMate.service;

import RM.ReadMate.dto.BookDto;
import RM.ReadMate.entity.Book;
import RM.ReadMate.repository.BookRepository;
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
    private final String GOOGLE_BOOKS_API_KEY = "AIzaSyD8CJbNQX3AialFRwia9TcwPqDY1fWuPjU"; // 발급받은 키로 교체

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

    public BookDto fetchBookFromApis(String title) {
        // DB에서 먼저 조회
        Optional<Book> existingBook = bookRepository.findByBookName(title);

        if (existingBook.isPresent()) {
            Book book = existingBook.get();
            System.out.println("✅ DB에서 조회된 책 데이터: " + book);
            return convertToDto(book);
        }

        try {
            BookDto dto = fetchBookByTitleFromGoogleBooks(title);

            // DB에 저장 후 DTO 반환
            Book bookEntity = Book.builder()
                    .isbn(dto.getIsbn())
                    .bookName(dto.getBookName())
                    .bookImage(dto.getBookImage())
                    .publisher(dto.getPublisher())
                    .genre(dto.getGenre())
                    .build();

            bookRepository.save(bookEntity);

            System.out.println("🔍 API로부터 가져와 DB에 저장한 책 데이터: " + dto);
            return dto;

        } catch (Exception e) {
            System.err.println("❌ 데이터 불러오는 중 오류 발생: " + e.getMessage());
            return null;
        }
    }

    private BookDto fetchBookByTitleFromGoogleBooks(String title) throws Exception {
        String apiUrl = "https://www.googleapis.com/books/v1/volumes?q=" + URLEncoder.encode(title, "UTF-8") +
                "&key=" + GOOGLE_BOOKS_API_KEY;
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
                .isbn(volumeInfo.has("industryIdentifiers") ? volumeInfo.getJSONArray("industryIdentifiers").getJSONObject(0).optString("identifier") : "")
                .bookName(volumeInfo.optString("title"))
                .bookImage(volumeInfo.has("imageLinks") ? volumeInfo.getJSONObject("imageLinks").optString("thumbnail") : "")
                .publisher(volumeInfo.optString("publisher", ""))
                .genre(volumeInfo.has("categories") ? volumeInfo.getJSONArray("categories").optString(0) : "")
                .build();
    }

    private BookDto convertToDto(Book book) {
        return BookDto.builder()
                .id(book.getId().intValue())
                .isbn(book.getIsbn())
                .bookName(book.getBookName())
                .bookImage(book.getBookImage())
                .genre(book.getGenre())
                .publisher(book.getPublisher())
                .build();
    }
}
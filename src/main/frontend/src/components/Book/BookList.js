import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/styles/Book/BookList.module.css';
import { FaBook } from 'react-icons/fa';
import defaultBookImage from '../../assets/images/book-normal.jpg';

function BookList() {
    // URL 에서는 인코딩된 값이 들어오므로 다시 디코딩
    const { genre: rawGenreParam } = useParams();
    const genre = rawGenreParam ? decodeURIComponent(rawGenreParam) : null;

    const [books, setBooks] = useState([]);
    const [groupedBooks, setGroupedBooks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // 항상 전체 도서를 불러와서 프론트에서 장르 필터링
        axios
            .get('http://localhost:8080/api/books')
            .then((response) => {
                const allBooks = response.data || [];

                // 선택된 장르에 따라 필터링 방식 결정
                if (!genre || genre === '전체') {
                    // 전체
                    setBooks(allBooks);
                    setGroupedBooks({});
                } else if (genre === '소설') {
                    // "소설"은 하위 장르(예: "한국 소설", "영미 소설")별로 그룹핑
                    const novelBooks = allBooks.filter(
                        (book) => book.genre && book.genre.includes('소설')
                    );

                    const grouped = novelBooks.reduce((acc, book) => {
                        const key = book.genre || '기타 소설';
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(book);
                        return acc;
                    }, {});

                    setGroupedBooks(grouped);
                    setBooks([]);
                } else if (genre === '시-에세이') {
                    // 시/희곡 + 에세이 묶음
                    const filtered = allBooks.filter(
                        (book) =>
                            book.genre === '시/희곡' ||
                            book.genre === '에세이'
                    );
                    setBooks(filtered);
                    setGroupedBooks({});
                } else {
                    // 나머지(경제/경영, 자기계발, 인문 등)는 장르 정확히 일치
                    const filtered = allBooks.filter(
                        (book) => book.genre === genre
                    );
                    setBooks(filtered);
                    setGroupedBooks({});
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error(`Error fetching books for genre ${genre}:`, error);
                setLoading(false);
            });
    }, [genre]);

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    const pageTitle = genre ? `${genre} 도서 목록` : '전체 도서 목록';

    const renderBookList = (bookList) => (
        <div className={styles.bookList}>
            {bookList.map((book) => (
                <Link
                    to={`/books/${book.id}`}
                    key={book.id}
                    className={styles.bookItemLink}
                >
                    <div className={styles.bookItem}>
                        <img
                            src={book.bookImage || defaultBookImage}
                            alt={book.bookName}
                            className={styles.bookCover}
                        />
                        <h3 className={styles.bookTitle}>{book.bookName}</h3>
                        <p className={styles.bookAuthor}>{book.author}</p>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                <FaBook /> {pageTitle}
            </h1>

            {genre === '소설' ? (
                Object.keys(groupedBooks).length > 0 ? (
                    Object.entries(groupedBooks).map(
                        ([groupName, booksInGroup]) => (
                            <section
                                key={groupName}
                                className={styles.subGenreSection}
                            >
                                <h2 className={styles.subGenreTitle}>
                                    {groupName}
                                </h2>
                                {renderBookList(booksInGroup)}
                            </section>
                        )
                    )
                ) : (
                    <p>해당 장르의 도서가 없습니다.</p>
                )
            ) : books.length > 0 ? (
                renderBookList(books)
            ) : (
                <p>해당 장르의 도서가 없습니다.</p>
            )}
        </div>
    );
}

export default BookList;

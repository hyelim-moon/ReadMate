import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/styles/Book/BookList.module.css';
import { FaBook } from 'react-icons/fa';
import defaultBookImage from '../../assets/images/book-normal.jpg';

function BookList() {
    const { genre } = useParams();
    const [books, setBooks] = useState([]);
    const [groupedBooks, setGroupedBooks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const isNovelCategory = genre === '소설';
        const fetchUrl = isNovelCategory || (genre && genre === '전체') || !genre
            ? 'http://localhost:8080/api/books'
            : `http://localhost:8080/api/books/genre/${genre}`;

        axios.get(fetchUrl)
            .then(response => {
                if (isNovelCategory) {
                    // 장르 이름에 '소설'이 포함된 모든 책을 필터링합니다.
                    const novelBooks = response.data.filter(book => book.genre && book.genre.includes('소설'));
                    
                    const grouped = novelBooks.reduce((acc, book) => {
                        const key = book.genre; // '고전 소설', '영미 소설' 등을 그룹 이름으로 사용합니다.
                        if (!acc[key]) {
                            acc[key] = [];
                        }
                        acc[key].push(book);
                        return acc;
                    }, {});
                    
                    setGroupedBooks(grouped);
                    setBooks([]);
                } else {
                    setBooks(response.data);
                    setGroupedBooks({});
                }
                setLoading(false);
            })
            .catch(error => {
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
            {bookList.map(book => (
                <Link to={`/books/${book.id}`} key={book.id} className={styles.bookItemLink}>
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
                    Object.entries(groupedBooks).map(([groupName, booksInGroup]) => (
                        <section key={groupName} className={styles.subGenreSection}>
                            <h2 className={styles.subGenreTitle}>{groupName}</h2>
                            {renderBookList(booksInGroup)}
                        </section>
                    ))
                ) : (
                    <p>해당 장르의 도서가 없습니다.</p>
                )
            ) : (
                books.length > 0 ? renderBookList(books) : <p>해당 장르의 도서가 없습니다.</p>
            )}
        </div>
    );
}

export default BookList;

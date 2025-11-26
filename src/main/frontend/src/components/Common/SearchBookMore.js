// src/pages/Search/SearchBookMore.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../assets/styles/SearchBookMore.module.css';
import { FaBook } from 'react-icons/fa';
import defaultBookImage from '../../assets/images/book-normal.jpg';

function SearchBookMore() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // URL에서 keyword와 category 가져오기
    const keyword = queryParams.get('keyword') || '';
    const category = queryParams.get('category') || '전체';

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Fetching books...', { keyword, category });
        console.log('SearchBookMore params:', { keyword, category });

        if (!keyword) return;

        setLoading(true);

        axios.get('http://localhost:8080/api/search', {
            params: {
                keyword: keyword,
                category: category
            }
        })
            .then(res => {
                console.log('API response:', res.data);
                // 서버 응답 구조 확인 후 books 배열 가져오기
                const booksData = res.data.books || [];
                setBooks(booksData);
            })
            .catch(err => {
                console.error('API error:', err); //
                setBooks([]);
            })
            .finally(() => setLoading(false));

    }, [keyword, category]);

    if (loading) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                <FaBook /> "{keyword}" 책 검색 결과 전체보기
            </h1>

            {books.length > 0 ? (
                <div className={styles.bookList}>
                    {books.map((book) => (
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
            ) : (
                <p>검색 결과가 없습니다.</p>
            )}
        </div>
    );
}

export default SearchBookMore;

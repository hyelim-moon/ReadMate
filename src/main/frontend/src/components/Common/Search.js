import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/Search.module.css';
import axios from 'axios';

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('keyword') || '';

    const [books, setBooks] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const category = queryParams.get('category') || '전체';

    /*useEffect(() => {
        if (!searchTerm) return;

        setLoading(true);
        axios.get(`http://localhost:8080/api/search?keyword=${encodeURIComponent(searchTerm)}`)
            .then(res => {
                setBooks(res.data.books || []);
                setPosts(res.data.posts || []);
            })
            .catch(err => console.error('검색 실패:', err))
            .finally(() => setLoading(false));
    }, [searchTerm]);
*/

    useEffect(() => {
        if (!searchTerm) return;

        setLoading(true);
        axios.get(`http://localhost:8080/api/search`, {
            params: {
                keyword: searchTerm,
                category: category
            }
        })
            .then(res => {
                setBooks(res.data.books || []);
                setPosts(res.data.posts || []);
            })
            .catch(err => console.error('검색 실패:', err))
            .finally(() => setLoading(false));
    }, [searchTerm, category]);

    const handleMoreClick = (category) => {
        if (category === "community") {
            navigate(`/community?keyword=${searchTerm}`);
        } else if (category === "books") {
            navigate(`/books?keyword=${searchTerm}`);
        } else {
            navigate(`/search/${category}?keyword=${searchTerm}`);
        }
    };


    if (loading) return <div className={styles.loading}>검색 중...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <h1 className={styles.title}>"{searchTerm}" 검색 결과</h1>
                <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로가기</button>
            </div>

            <div className={styles.grid}>
                {/* 책 */}
                <div className={styles.sectionBox}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.subTitle}>책</h2>
                        <button
                            onClick={() => navigate(`/search/books?keyword=${encodeURIComponent(searchTerm)}&category=${category}`)}
                            className={styles.moreButton}
                        >
                            더보기
                        </button>


                    </div>
                    {books.length > 0 ? (
                        <div className={styles.bookGrid}>
                            {books.slice(0, 6).map(book => (
                                <div key={book.id} className={styles.bookCard}>

                                    {/* 이미지 클릭 */}
                                    <img
                                        src={book.bookImage}
                                        alt={book.bookName}
                                        className={styles.bookImage}
                                        onClick={() => navigate(`/books/${book.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    />

                                    {/* 제목 클릭 */}
                                    <p
                                        className={styles.bookTitle}
                                        onClick={() => navigate(`/books/${book.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {book.bookName}
                                    </p>

                                </div>
                            ))}


                        </div>
                    ) : (
                        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
                    )}
                </div>

                {/* 커뮤니티 */}
                <div className={styles.sectionBox}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.subTitle}>커뮤니티</h2>
                        <button className={styles.moreButton} onClick={() => handleMoreClick('community')}>더보기</button>
                    </div>
                    {posts.length > 0 ? (
                        <div className={styles.postGrid}>
                            {posts.slice(0, 6).map(post => (
                                <div key={post.id} className={styles.postCard}>

                                    <p
                                        className={styles.postTitle}
                                        onClick={() => navigate(`/community/${post.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {post.title}
                                    </p>

                                </div>
                            ))}

                        </div>
                    ) : (
                        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;

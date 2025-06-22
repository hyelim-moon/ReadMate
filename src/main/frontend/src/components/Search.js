import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Search.module.css';
import axios from 'axios';

function Search() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchTerm = queryParams.get('keyword') || '';

    const [books, setBooks] = useState([]);
    const [records, setRecords] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!searchTerm) return;

        axios.get(`http://localhost:8080/api/search?keyword=${searchTerm}`)
            .then(res => {
                setBooks(res.data.books || []);
                setRecords(res.data.records || []);
                setPosts(res.data.posts || []);
            })
            .catch(err => console.error('검색 실패:', err));
    }, [searchTerm]);

    const handleMoreClick = (category) => {
        navigate(`/search/${category}?keyword=${searchTerm}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <h1 className={styles.title}>통합 검색 결과</h1>
                <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로가기</button>
            </div>

            <div className={styles.grid}>
                {/* 책 */}
                <div className={styles.sectionBox}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.subTitle}>책</h2>
                        <button className={styles.moreButton} onClick={() => handleMoreClick('books')}>더보기</button>
                    </div>
                    {books.length > 0 ? (
                        <ul className={styles.itemList}>
                            {books.slice(0, 3).map(item => (
                                <li key={item.id} className={styles.item}>
                                    {item.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
                    )}
                </div>

                {/* 독서기록 */}
                <div className={styles.sectionBox}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.subTitle}>독서기록</h2>
                        <button className={styles.moreButton} onClick={() => handleMoreClick('records')}>더보기</button>
                    </div>
                    {records.length > 0 ? (
                        <ul className={styles.itemList}>
                            {records.slice(0, 3).map(item => (
                                <li key={item.id} className={styles.item}>
                                    {item.title}
                                </li>
                            ))}
                        </ul>
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
                        <ul className={styles.itemList}>
                            {posts.slice(0, 3).map(item => (
                                <li key={item.id} className={styles.item}>
                                    {item.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Community.module.css';

function Community() {
    const [posts, setPosts] = useState([]);
    const [bestPosts, setBestPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/community')
            .then(res => {
                const allPosts = res.data;
                setPosts(allPosts);

                const sorted = [...allPosts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
                setBestPosts(sorted.slice(0, 5));
            })
            .catch(err => console.error(err));
    }, []);

    const handleSearch = () => {
        console.log('검색어:', searchTerm, '시작일:', startDate, '종료일:', endDate);
    };

    const handleWriteClick = () => {
        navigate('/community/write');
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📢 커뮤니티</h1>

            {/* 검색창 영역 */}
            <div className={styles.searchRow}>
                <div className={styles.dateGroup}>
                    <label className={styles.dateLabel}>
                        시작일
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </label>
                    <label className={styles.dateLabel}>
                        종료일
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </label>
                </div>

                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="#검색어 입력"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button className={styles.searchButton} onClick={handleSearch}>검색</button>
            </div>

            {/* 최신 글 / BEST 영역 */}
            <div className={styles.grid}>
                <div className={styles.sectionBox}>
                    <h2 className={styles.subTitle}>📝 최신 글</h2>
                    {posts.length > 0 ? (
                        <div className={styles.postList}>
                            {posts.map(post => (
                                <div key={post.id} className={styles.postCard}>
                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                    <p className={styles.postContent}>{post.content}</p>
                                    <div className={styles.postMeta}>{post.timeAgo} · 익명</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyMessage}>게시글이 없습니다.</div>
                    )}
                </div>

                <div className={styles.sectionBoxSmall}>
                    <h2 className={styles.subTitle}>🔥 BEST</h2>
                    {bestPosts.length > 0 ? (
                        <div className={styles.bestList}>
                            {bestPosts.map(post => (
                                <div key={post.id} className={styles.bestItem}>
                                    <div className={styles.bestTitle}>{post.title}</div>
                                    <div className={styles.bestMeta}>❤️ {post.likes} · {post.timeAgo}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyMessage}>인기 게시글이 없습니다.</div>
                    )}
                </div>
            </div>

            <button className={styles.floatingWriteButton} onClick={handleWriteClick}>
                글쓰기
            </button>
        </div>
    );
}

export default Community;

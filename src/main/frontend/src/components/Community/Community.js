import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../assets/styles/Community.module.css';

function timeAgoFromDate(dateString) {
    if (!dateString) return '등록 시간 정보 없음';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
}

function Community() {
    const [posts, setPosts] = useState([]);
    const [bestPosts, setBestPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const navigate = useNavigate();
    const location = useLocation(); // ⭐ 추가

    // 전체 게시글 최초 로드
    useEffect(() => {
        axios.get("http://localhost:8080/api/community")
            .then(res => {
                const sortedByDate = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedByDate);
                setFilteredPosts(sortedByDate);

                const sortedByLikes = [...res.data].sort((a, b) => (b.likes || 0) - (a.likes || 0));
                setBestPosts(sortedByLikes.slice(0, 5));
            })
            .catch(err => {
                console.error('게시글 불러오기 실패:', err);
                alert('게시글 불러오기에 실패했습니다.');
            });
    }, []);

    // 검색 API 호출
    const handleSearch = () => {
        if (!searchTerm && !startDate && !endDate) {
            setFilteredPosts(posts);
            return;
        }

        axios.get("http://localhost:8080/api/community/search", {
            params: {
                keyword: searchTerm,
                startDate,
                endDate
            }
        })
            .then(res => {
                const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setFilteredPosts(sorted);
            })
            .catch(err => {
                console.error("검색 실패:", err);
                alert("검색 중 오류가 발생했습니다.");
            });
    };

    // ⭐ URL 파라미터로 넘어온 keyword 자동검색
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const keywordParam = params.get("keyword");

        if (keywordParam) {
            setSearchTerm(keywordParam);

            // posts 데이터 로딩 후 검색 실행
            if (posts.length > 0) {
                setTimeout(() => {
                    handleSearch();
                }, 100);
            }
        }
    }, [location.search, posts]); // ⭐ posts 로딩 이후 실행

    const handlePostClick = (id) => navigate(`/community/${id}`);
    const handleWriteClick = () => navigate('/community/write');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>커뮤니티</h1>

            {/* 검색 UI (디자인 그대로 유지) */}
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

                <div className={styles.searchBox}>
                    <input
                        type="text"
                        className={`${styles.searchInput} ${searchTerm.startsWith('#') ? styles.tagStyle : ''}`}
                        placeholder="검색어 또는 #태그 입력"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <button className={styles.searchButton} onClick={handleSearch}>
                    🔍︎검색
                </button>
            </div>

            {/* 최신 글 */}
            <div className={styles.grid}>
                <div className={styles.sectionBox}>
                    <h2 className={styles.subTitle}>최신 글</h2>
                    {filteredPosts.length > 0 ? (
                        <div className={styles.postList}>
                            {filteredPosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.postCard}
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    {post.imagePath && (
                                        <img
                                            src={`http://localhost:8080${post.imagePath}`}
                                            alt=""
                                            className={styles.postImage}
                                        />
                                    )}
                                    <div className={styles.postContentBox}>
                                        <h3 className={styles.postTitle}>{post.title}</h3>
                                        <p className={styles.postContent}>
                                            {post.content?.length > 120
                                                ? `${post.content.slice(0, 120)}...`
                                                : post.content}
                                        </p>
                                        <div className={styles.postMeta}>
                                            {timeAgoFromDate(post.createdAt)} · 익명
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyMessage}>게시글이 없습니다.</div>
                    )}
                </div>

                {/* 인기 글 BEST */}
                <div className={styles.sectionBoxSmall}>
                    <h2 className={styles.subTitle}>BEST</h2>

                    {bestPosts.length > 0 ? (
                        <div className={styles.bestList}>
                            {bestPosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.bestItem}
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    <div className={styles.bestTitle}>{post.title}</div>
                                    <div className={styles.bestMeta}>
                                        ❤️ {post.likes || 0} · {timeAgoFromDate(post.createdAt)}
                                    </div>
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

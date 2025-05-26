import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Community.module.css';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]); // 👈 추가

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:8080/api/community")
            .then(res => {
                setPosts(res.data);
                setFilteredPosts(res.data);  // 👈 초기에는 전체 게시글 표시
                const sorted = [...res.data].sort((a, b) => (b.likes || 0) - (a.likes || 0));
                setBestPosts(sorted.slice(0, 5));
            })
            .catch(err => console.error('게시글 불러오기 실패:', err));
    }, []);

    const handleSearch = () => {
        // 둘 다 값이 있을 때만 비교
        if (startDate && endDate) {
            if (startDate > endDate) {
                alert('시작일이 종료일보다 늦을 수 없습니다. 날짜를 다시 선택해 주세요.');
                return;
            }
        }

        // 검색어, 날짜 없는 경우 전체 게시글 표시
        if (!searchTerm && !startDate && !endDate) {
            setFilteredPosts(posts);
            return;
        }

        const filtered = posts.filter(post => {
            const postDateStr = new Date(post.createdAt).toISOString().split('T')[0];

            const titleMatch = searchTerm
                ? (post.title.includes(searchTerm) || post.content.includes(searchTerm))
                : true;

            const isAfterStart = startDate ? postDateStr >= startDate : true;
            const isBeforeEnd = endDate ? postDateStr <= endDate : true;

            return titleMatch && isAfterStart && isBeforeEnd;
        });

        setFilteredPosts(filtered);
    };

    const handleWriteClick = () => {
        navigate('/community/write');
    };

    const handlePostClick = (id) => {
        navigate(`/community/${id}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>📢 커뮤니티</h1>

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

            <div className={styles.grid}>
                <div className={styles.sectionBox}>
                    <h2 className={styles.subTitle}>📝 최신 글</h2>
                    {filteredPosts.length > 0 ? (
                        <div className={styles.postList}>
                            {filteredPosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.postCard}
                                    onClick={() => handlePostClick(post.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {post.imagePath && (
                                        <img
                                            src={`http://localhost:8080${post.imagePath}`}
                                            alt={`${post.title} 이미지`}
                                            className={styles.postImage}
                                        />
                                    )}
                                    <div className={styles.postContentBox}>
                                        <h3 className={styles.postTitle}>{post.title}</h3>
                                        <p className={styles.postContent}>
                                            {post.content.length > 120 ? `${post.content.slice(0, 120)}...` : post.content}
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

                <div className={styles.sectionBoxSmall}>
                    <h2 className={styles.subTitle}>🔥 BEST</h2>
                    {bestPosts.length > 0 ? (
                        <div className={styles.bestList}>
                            {bestPosts.map(post => (
                                <div
                                    key={post.id}
                                    className={styles.bestItem}
                                    onClick={() => handlePostClick(post.id)}
                                    style={{ cursor: 'pointer' }}
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

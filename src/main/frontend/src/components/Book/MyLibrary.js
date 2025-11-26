import React, { useEffect, useState, useRef } from 'react';
import styles from '../../assets/styles/MyLibrary.module.css';
import { useNavigate } from 'react-router-dom';

function MyLibrary() {
    const [savedBooks, setSavedBooks] = useState([]);
    const [filter, setFilter] = useState('all'); // 전체, finished, reading, wishlist
    const [sortKey, setSortKey] = useState('savedAt'); // savedAt, title, totalPages, score 추가
    const [sortOrder, setSortOrder] = useState('desc'); // desc (내림차순) or asc (오름차순)
    const [error, setError] = useState(null); // 에러 상태 추가

    const navigate = useNavigate();
    const hasPrompted = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');

        if (!token || token === 'undefined' || token === '') {
            if (!hasPrompted.current) {
                hasPrompted.current = true;
                const shouldLogin = window.confirm(
                    '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
                );
                if (shouldLogin) {
                    navigate('/login');
                }
            }
            return;
        }

        const fetchSavedBooks = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/saved-books`, { // API 경로 수정
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`저장한 책 데이터를 불러오지 못했습니다. 상태: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                console.log('API 응답 데이터:', data); // API 응답 데이터 전체 확인
                setSavedBooks(data);
            } catch (error) {
                console.error('내 서재 데이터 오류:', error);
                setError(error.message); // 에러 메시지를 상태로 저장
            }
        };

        fetchSavedBooks();
    }, [navigate]);

    // 필터
    const filteredBooks = savedBooks.filter((saved) => {
        if (filter === 'finished') return saved.progress === 100;
        if (filter === 'reading') return saved.progress > 0 && saved.progress < 100;
        if (filter === 'wishlist') return saved.progress === 0;
        return true;
    });

    // 정렬
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        let valA, valB;

        switch (sortKey) {
            case 'title':
                valA = (a.bookTitle || '').toLowerCase();
                valB = (b.bookTitle || '').toLowerCase();
                console.log(`Sorting by title: A='${valA}', B='${valB}'`); // 디버깅 로그
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            case 'pageCount': // totalPages로 변경
                valA = a.totalPages || 0; // totalPages로 수정
                valB = b.totalPages || 0; // totalPages로 수정
                console.log(`Sorting by totalPages: A=${valA}, B=${valB}`); // 디버깅 로그
                break;
            case 'savedAt':
                valA = new Date(a.savedAt || 0);
                valB = new Date(b.savedAt || 0);
                console.log(`Sorting by savedAt: A=${valA}, B=${valB}`); // 디버깅 로그
                break;
            case 'rating': // score로 변경
                valA = a.score || 0; // score로 수정
                valB = b.score || 0; // score로 수정
                console.log(`Sorting by score: A=${valA}, B=${valB}`); // 디버깅 로그
                break;
            default:
                return 0; // 알 수 없는 sortKey일 경우 정렬하지 않음
        }

        // 숫자 또는 날짜 비교
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // 정렬 순서 토글
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleCardClick = (id) => {
        navigate(`/mybook/${id}`);
    };

    return (
        <main className={styles.recordListPage}>
            <h2 className={styles.pageTitle}>내 서재</h2>

            {/* 필터 + 정렬 */}
            <div className={styles.topControls}>
                <div className={styles.filterButtons}>
                    {['all', 'finished', 'reading', 'wishlist'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`${styles.filterButton} ${filter === f ? styles.active : ''}`}
                        >
                            {f === 'all' && '전체'}
                            {f === 'finished' && '읽은 책'}
                            {f === 'reading' && '읽고 있는 책'}
                            {f === 'wishlist' && '읽고 싶은 책'}
                        </button>
                    ))}
                </div>
                <div className={styles.sortLabelContainer}>
                    {['title', 'pageCount', 'rating'].map((key) => ( // 'pageCount' -> 'totalPages', 'rating' -> 'score'
                        <span
                            key={key}
                            className={`${styles.sortLabel} ${sortKey === key ? styles.active : ''}`}
                            onClick={() => setSortKey(key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') setSortKey(key);
                            }}
                            aria-pressed={sortKey === key}
                        >
                            {key === 'title' && '제목순'}
                            {key === 'pageCount' && '쪽수순'} {/* UI는 pageCount로 유지 */}
                            {key === 'rating' && '별점순'} {/* UI는 rating으로 유지 */}
                        </span>
                    ))}
                    <span
                        className={styles.sortOrderToggle}
                        onClick={toggleSortOrder}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') toggleSortOrder();
                        }}
                        aria-label={`정렬 순서 ${sortOrder === 'asc' ? '오름차순' : '내림차순'} 토글`}
                    >
                        {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                </div>
            </div>

            {/* 오류 처리 메시지 */}
            {error && (
                <div className={styles.errorMessage}>
                    <p>{error}</p>
                </div>
            )}

            {/* 책 목록 */}
            <div className={styles.recordListContainer}>
                {sortedBooks.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>저장한 책이 없습니다.</p>
                    </div>
                ) : (
                    sortedBooks.map((saved) => {
                        console.log('Rendering saved book:', saved); // 각 책 객체 전체 로그
                        return (
                            <div
                                key={saved.id}
                                className={styles.recordCard}
                                onClick={() => handleCardClick(saved.id)}
                            >
                                {/* 책 이미지가 있는 경우 */}
                                {saved.bookImage ? (
                                    <img
                                        src={saved.bookImage || '/default-book-image.jpg'}
                                        alt={`${saved.bookTitle} 책 이미지`}
                                        className={styles.recordImage}
                                    />
                                ) : (
                                    <img
                                        src="/default-book-image.jpg"
                                        alt="기본 책 이미지"
                                        className={styles.recordImage}
                                    />
                                )}

                                <div className={styles.recordContent}>
                                    <h3 className={styles.recordTitle}>{saved.bookTitle || '제목 없음'}</h3>
                                    <div className={styles.recordInfo}>
                                        <p><strong>저자:</strong> {saved.bookAuthor || '저자 미상'}</p>
                                        <p><strong>출판사:</strong> {saved.bookPublisher || '출판사 미상'}</p>
                                        <p><strong>장르:</strong> {saved.bookGenre || '장르 미상'}</p>
                                    </div>
                                    {/* 별점 표시 제거 */}
                                    {/* {saved.rating !== undefined && (
                                        <div className={styles.bookRating}>
                                            {'⭐'.repeat(saved.rating)} ({saved.rating}/5)
                                        </div>
                                    )} */}
                                </div>

                                <div className={styles.readingInfo}>
                                    <div className={styles.progressWrapper}>
                                        <div
                                            className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${saved.progress}%` }}
                                            />
                                        </div>
                                        <span className={styles.progressText}>
                                            {saved.progress !== undefined ? `${saved.progress}% 읽음` : '진행 없음'}
                                        </span>
                                    </div>
                                    <p className={styles.readingPeriod}>
                                        {saved.startedAt || '-'} ~ {saved.finishedAt || '읽는 중'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default MyLibrary;
import React, { useEffect, useState, useRef } from 'react';
import styles from '../assets/styles/MyLibrary.module.css';
import { useNavigate } from 'react-router-dom';

function MyLibrary() {
    const [savedBooks, setSavedBooks] = useState([]);
    const [filter, setFilter] = useState('all'); // 전체, finished, reading, wishlist
    const [sortKey, setSortKey] = useState('savedAt'); // savedAt, title, pageCount (기본 최신 저장일)
    const [sortOrder, setSortOrder] = useState('desc'); // desc (내림차순) or asc (오름차순)

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

        // 더미 데이터에 savedAt, pageCount 필드 추가 (정렬용)
        const dummyBooks = [
            {
                id: 1,
                title: '모모',
                author: '미하엘 엔데',
                publisher: '비룡소',
                genre: '판타지',
                content: '시간을 도둑맞은 사람들에게 시간을 되돌려주는 소녀의 이야기.',
                photo: '/momo.jpg',
                startedAt: '2024-11-01',
                finishedAt: '2024-11-20',
                progress: 100,
                savedAt: '2025-06-15',
                pageCount: 250,
            },
            {
                id: 2,
                title: '어린 왕자',
                author: '생텍쥐페리',
                publisher: '열린책들',
                genre: '우화',
                content: '어른이 되어버린 이들을 위한 순수한 마음의 이야기.',
                photo: '/little_prince.jpg',
                startedAt: '2025-01-15',
                finishedAt: null,
                progress: 40,
                savedAt: '2025-05-10',
                pageCount: 120,
            },
            {
                id: 3,
                title: '데미안',
                author: '헤르만 헤세',
                publisher: '민음사',
                genre: '소설',
                content: '자아를 찾아가는 청년의 성장 이야기.',
                photo: '/demian.jpg',
                startedAt: '2025-04-01',
                finishedAt: null,
                progress: 70,
                savedAt: '2025-06-10',
                pageCount: 180,
            },
            {
                id: 4,
                title: '해리포터와 마법사의 돌',
                author: 'J.K. 롤링',
                publisher: '문학수첩',
                genre: '판타지',
                content: '마법사 학교에서 펼쳐지는 신비한 모험.',
                photo: '/harry_potter1.jpg',
                startedAt: '2025-03-05',
                finishedAt: '2025-04-20',
                progress: 100,
                savedAt: '2025-05-25',
                pageCount: 320,
            },
            {
                id: 5,
                title: '폭풍의 언덕',
                author: '에밀리 브론테',
                publisher: '문학동네',
                genre: '고전 소설',
                content: '요크셔의 황량한 고원에서 펼쳐지는 히스클리프와 캐서린의 격렬하고 비극적인 사랑과 복수 이야기.',
                photo: '/wuthering_heights.jpg',
                startedAt: '2025-05-01',
                finishedAt: '2025-05-30',
                progress: 100,
                savedAt: '2025-06-18',
                pageCount: 400,
            },
            {
                id: 6,
                title: '제인 에어',
                author: '샬롯 브론테',
                publisher: '문학동네',
                genre: '고전 소설',
                content: '어려운 유년 시절을 극복하고 자신만의 삶과 사랑을 찾아가는 강인한 여성 제인 에어의 이야기.',
                photo: '/jane_eyre.jpg',
                startedAt: null,
                finishedAt: null,
                progress: 0,
                savedAt: null,
                pageCount: 500,
            }
        ];

        setSavedBooks(dummyBooks);

        // 실제 API 호출 부분 (필요시 활성화)
        /*
        const fetchSavedBooks = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/users/me/saved-books', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error('저장한 책 데이터를 불러오지 못했습니다.');
                const data = await response.json();
                setSavedBooks(data);
            } catch (error) {
                console.error('내 서재 데이터 오류:', error);
            }
        };
        fetchSavedBooks();
        */
    }, [navigate]);

    // 필터 적용
    const filteredBooks = savedBooks.filter((book) => {
        if (filter === 'finished') return book.progress === 100;
        if (filter === 'reading') return book.progress > 0 && book.progress < 100;
        if (filter === 'wishlist') return book.progress === 0;
        return true;
    });

    // 정렬 적용
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        let valA, valB;
        if (sortKey === 'title') {
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
        } else if (sortKey === 'pageCount') {
            valA = a.pageCount;
            valB = b.pageCount;
        } else if (sortKey === 'savedAt') {
            valA = new Date(a.savedAt);
            valB = new Date(b.savedAt);
        }

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

            {/* 필터 버튼 */}
            <div className={styles.topControls}>
                {/* 필터 토글 버튼들 */}
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
                    {['savedAt', 'title', 'pageCount'].map((key) => (
                        <span
                            key={key}
                            className={`${styles.sortLabel} ${sortKey === key ? styles.active : ''}`}
                            onClick={() => setSortKey(key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') setSortKey(key); }}
                            aria-pressed={sortKey === key}
                        >
                            {key === 'savedAt' && '최신 저장일순'}
                            {key === 'title' && '제목순'}
                            {key === 'pageCount' && '쪽수순'}
                         </span>
                    ))}

                    {/* 오름차순/내림차순 토글 */}
                    <span
                        className={styles.sortOrderToggle}
                        onClick={toggleSortOrder}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') toggleSortOrder(); }}
                        aria-label={`정렬 순서 ${sortOrder === 'asc' ? '오름차순' : '내림차순'} 토글`}
                    >
                        {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                </div>


                <div className={styles.recordListContainer}>
                    {sortedBooks.length === 0 ? (
                        <div className={styles.nothing}>
                            <p className={styles.emptyMessage}>저장한 책이 없습니다.</p>
                        </div>
                    ) : (
                        sortedBooks.map((book) => (
                            <div
                                key={book.id}
                                className={styles.recordCard}
                                onClick={() => handleCardClick(book.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                {book.photo && (
                                    <img
                                        src={book.photo}
                                        alt={`${book.title} 책 이미지`}
                                        className={styles.recordImage}
                                    />
                                )}
                                <div className={styles.recordContent}>
                                    <h3 className={styles.recordTitle}>{book.title}</h3>
                                    <div className={styles.recordInfo}>
                                        <p className={styles.recordAuthor}>
                                            <strong>저자:</strong> {book.author}
                                        </p>
                                        <p className={styles.recordPublisher}>
                                            <strong>출판사:</strong> {book.publisher}
                                        </p>
                                        <p className={styles.recordGenre}>
                                            <strong>장르:</strong> {book.genre}
                                        </p>
                                    </div>
                                </div>

                                    <div className={styles.readingInfo}>
                                        <div className={styles.progressWrapper}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${book.progress}%` }}
                                                />
                                            </div>
                                            <span className={styles.progressText}>{book.progress}% 읽음</span>
                                        </div>
                                        <p className={styles.readingPeriod}>
                                            {book.startedAt} ~ {book.finishedAt || '읽는 중'}
                                        </p>
                                    </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

export default MyLibrary;

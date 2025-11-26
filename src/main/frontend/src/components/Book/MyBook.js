import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/MyBook.module.css';
import EditMyBook from './EditMyBook'; // 수정 모달 컴포넌트 import

// 별점 컴포넌트
function StarRating({ score }) {
    const fullStars = Math.floor(score);
    const emptyStars = 5 - fullStars;
    return (
        <div className={styles.starRating} aria-label={`독서 만족도 ${score}점`}>
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className={styles.star}>&#9733;</span>
            ))}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} className={styles.starEmpty}>&#9733;</span>
            ))}
            <span className={styles.scoreText}>({score}점)</span>
        </div>
    );
}

// 하트 점수 컴포넌트
function HeartRating({ score }) {
    const fullHearts = Math.floor(score);
    const emptyHearts = 5 - fullHearts;
    return (
        <div className={styles.heartRating} aria-label={`읽고 싶은 정도 ${score}점`}>
            {[...Array(fullHearts)].map((_, i) => (
                <span key={`full-${i}`} className={styles.heart}>&#10084;</span>
            ))}
            {[...Array(emptyHearts)].map((_, i) => (
                <span key={`empty-${i}`} className={styles.heartEmpty}>&#10084;</span>
            ))}
            <span className={styles.scoreText}>({score}점)</span>
        </div>
    );
}

function MyBook() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBookData = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        setLoading(true);
        try {
            if (!token) {
                alert('로그인이 필요합니다!');
                navigate('/login');
                return;
            }
            const response = await fetch(`http://localhost:8080/api/saved-books/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
            const data = await response.json();
            setBook(data);
        } catch (error) {
            console.error('책 정보를 불러오는 중 오류 발생:', error);
            alert(`책 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
            navigate('/mylibrary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookData();
    }, [id, navigate]);

    const getReadingStatus = () => {
        if (!book) return '';
        if (book.progress === 100) return '읽은 책';
        if (book.progress > 0) return '읽는 중';
        return '읽을 예정';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 이 책을 내 서재에서 삭제하시겠습니까?')) {
            const token = localStorage.getItem('ACCESS_TOKEN');
            try {
                const response = await fetch(`http://localhost:8080/api/saved-books/${book.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    alert('책이 내 서재에서 삭제되었습니다.');
                    navigate('/mylibrary');
                } else {
                    throw new Error('삭제 실패');
                }
            } catch (error) {
                alert(`책 삭제 중 오류가 발생했습니다: ${error.message}`);
            }
        }
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!book) return <div className={styles.error}>책 정보를 불러오는 데 실패했습니다.</div>;

    const formattedContent = book.content?.split('\n').map((line, index) => (
        <React.Fragment key={index}>{line}<br /></React.Fragment>
    ));

    return (
        <>
            <div className={styles.myBookPage}>
                <div className={styles.bookHeader}>
                    <div className={styles.bookImageWrapper}>
                        <img src={book.bookImage} alt={book.bookTitle} className={styles.bookImage} />
                    </div>
                    <div className={styles.bookInfoArea}>
                        <span className={`${styles.statusBadge} ${styles[getReadingStatus().replace(' ', '')]}`}>
                            {getReadingStatus()}
                        </span>
                        <h1 className={styles.bookTitle}>{book.bookTitle}</h1>
                        <div className={styles.ratingArea}>
                            {book.progress === 0 ? (
                                <HeartRating score={book.wishScore || 0} />
                            ) : (
                                <StarRating score={book.score || 0} />
                            )}
                        </div>
                        <p className={styles.bookMeta}><strong>저자:</strong> {book.bookAuthor}</p>
                        <p className={styles.bookMeta}><strong>출판사:</strong> {book.bookPublisher}</p>
                        <p className={styles.bookMeta}><strong>장르:</strong> {book.bookGenre}</p>
                    </div>
                    <div className={styles.actionButtons}>
                        <button className={styles.editButton} onClick={() => setIsModalOpen(true)}>수정</button>
                        <button className={styles.deleteButton} onClick={handleDelete}>삭제</button>
                    </div>
                </div>

                <section className={styles.readingStatusSection}>
                    <h2 className={styles.sectionTitle}>나의 독서 현황</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <h3>독서 기간</h3>
                            <p>{formatDate(book.startedAt)} ~ {book.finishedAt ? formatDate(book.finishedAt) : '읽는 중'}</p>
                        </div>
                        <div className={styles.statusItem}>
                            <h3>진행률</h3>
                            <div className={styles.progressBarWrapper}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${book.progress}%` }} />
                                </div>
                                <span className={styles.progressText}>{book.progress}%</span>
                            </div>
                        </div>
                        <div className={styles.statusItem}>
                            <h3>페이지</h3>
                            <p>{book.currentPage} / {book.totalPages} 쪽</p>
                        </div>
                    </div>
                </section>

                <section className={styles.bookContentSection}>
                    <h2 className={styles.sectionTitle}>책 소개</h2>
                    <p className={styles.bookContent}>{formattedContent || '책 소개가 없습니다.'}</p>
                </section>
            </div>
            {isModalOpen && (
                <EditMyBook
                    book={book}
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        setIsModalOpen(false);
                        fetchBookData(); // 데이터 새로고침
                    }}
                />
            )}
        </>
    );
}

export default MyBook;

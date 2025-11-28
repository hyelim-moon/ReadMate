import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/BookDetail.module.css';
import { FaHeart, FaRegHeart, FaBookOpen, FaBookmark, FaRegBookmark } from 'react-icons/fa'; // 찜 아이콘, 독서 기록 아이콘, 내 서재 아이콘 추가

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [showFullContent, setShowFullContent] = useState(false);
    const [isWished, setIsWished] = useState(false); // 찜 여부 상태
    const [isSaved, setIsSaved] = useState(false); // 내 서재 저장 여부 상태
    const [currentUserId, setCurrentUserId] = useState(null); // 현재 로그인한 사용자 ID

    // 🔹 현재 사용자 ID 가져오기 (로그인 상태 확인)
    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (token) {
            axios.get('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setCurrentUserId(response.data.id);
                console.log("Current User ID:", response.data.id);
            })
            .catch(error => {
                console.error("사용자 정보 불러오기 실패:", error);
                setCurrentUserId(null);
            });
        }
    }, []);

    // 🔹 책 상세 정보 요청
    useEffect(() => {
        if (!id) return;

        const headers = {};
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (token) headers.Authorization = `Bearer ${token}`;

        axios.get(`http://localhost:8080/api/books/${id}`, { headers })
            .then(res => setBook(res.data))
            .catch(err => {
                console.error("책 상세 정보를 불러오지 못했습니다.", err);
                alert('책 정보를 불러오지 못했습니다. 로그인 상태를 확인해주세요.');
            });
    }, [id]);

    // 🔹 찜 여부 및 내 서재 저장 여부 확인
    useEffect(() => {
        if (!book?.id || !currentUserId) return;

        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        axios.get(`http://localhost:8080/api/wishlist/check?bookId=${book.id}`, { headers })
            .then(res => setIsWished(res.data))
            .catch(err => console.error("찜 여부 확인 실패:", err));

        axios.get(`http://localhost:8080/api/saved-books/check?bookId=${book.id}`, { headers })
            .then(res => setIsSaved(res.data))
            .catch(err => console.error("내 서재 저장 여부 확인 실패:", err));

    }, [book, currentUserId]);

    // 🔹 찜 버튼 토글
    const toggleWishlist = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token || !book?.id) {
            alert('로그인이 필요합니다.');
            return;
        }

        const url = `http://localhost:8080/api/wishlist/${book.id}`;
        try {
            if (isWished) {
                await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
                setIsWished(false);
            } else {
                await axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
                setIsWished(true);
            }
        } catch (err) {
            console.error('찜 처리 실패:', err);
            alert('찜 처리 중 오류가 발생했습니다.');
        }
    };

    // 🔹 내 서재 저장 버튼 토글
    const toggleSaveBook = async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token || !book?.id) {
            alert('로그인이 필요합니다.');
            return;
        }

        const url = `http://localhost:8080/api/saved-books/${book.id}`;
        try {
            if (isSaved) {
                await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
                setIsSaved(false);
            } else {
                await axios.post(url, null, { headers: { Authorization: `Bearer ${token}` } });
                setIsSaved(true);
            }
        } catch (err) {
            console.error('내 서재 저장 처리 실패:', err);
            alert('내 서재 저장 처리 중 오류가 발생했습니다.');
        }
    };

    // 🔹 리뷰 삭제 핸들러
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('리뷰가 삭제되었습니다.');
            axios.get(`http://localhost:8080/api/books/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setBook(res.data))
                .catch(err => console.error("책 상세 정보 새로고침 실패:", err));
        } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            alert('리뷰 삭제에 실패했습니다. 권한이 없거나 오류가 발생했습니다.');
        }
    };

    // 🔹 리뷰 신고 핸들러
    const handleReportReview = async (reviewId) => {
        const reason = prompt('신고 사유를 입력해주세요:');
        if (!reason || reason.trim() === '') {
            alert('신고 사유를 입력해야 합니다.');
            return;
        }

        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/reviews/${reviewId}/report`,
                { reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('리뷰가 신고되었습니다. 관리자 확인 후 조치될 예정입니다.');
        } catch (error) {
            console.error('리뷰 신고 실패:', error);
            alert('리뷰 신고에 실패했습니다. 오류가 발생했습니다.');
        }
    };


    if (!book) return <div>로딩 중...</div>;

    const truncatedContent = book.content?.length > 150
        ? book.content.slice(0, 150) + '...'
        : book.content;

    const calculateAverageRating = () => {
        if (!book.reviews || book.reviews.length === 0) {
            return "평점 없음";
        }
        const totalRating = book.reviews.reduce((acc, review) => acc + review.rating, 0);
        const average = totalRating / book.reviews.length;
        return `⭐ ${average.toFixed(1)}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.bookImageWrapper}>
                    <img src={book.bookImage} alt={book.bookName} className={styles.bookImage}/>
                </div>
                <div className={styles.bookDetails}>
                    <h2 className={styles.bookTitle}>{book.bookName}</h2>
                    <p className={styles.detailItem}><strong>저자:</strong> {book.author}</p>
                    <p className={styles.detailItem}><strong>출판사:</strong> {book.publisher}</p>
                    <p className={styles.detailItem}><strong>ISBN:</strong> {book.isbn}</p>
                    <p className={styles.detailItem}><strong>장르:</strong> {book.genre}</p>
                    <div className={styles.actionButtons}>
                        <button onClick={toggleWishlist} className={styles.wishBtn}>
                            {isWished ? <FaHeart className={styles.heartIconFilled}/> : <FaRegHeart className={styles.heartIconEmpty}/>}
                            <span>{isWished ? '찜 해제' : '찜하기'}</span>
                        </button>
                        <button onClick={toggleSaveBook} className={styles.saveBtn}>
                            {isSaved ? <FaBookmark className={styles.saveIconFilled}/> : <FaRegBookmark className={styles.saveIconEmpty}/>}
                            <span>{isSaved ? '내 서재에서 제거' : '내 서재에 저장'}</span>
                        </button>
                        <button
                            className={styles.recordBtn}
                            onClick={() => navigate(`/record?bookId=${book.id}`)}
                        >
                            <FaBookOpen className={styles.recordIcon}/>
                            <span>독서 기록 쓰기</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentSection}>
                <h3 className={styles.sectionTitle}>책 소개</h3>
                <div className={styles.descriptionWrapper}>
                    <p className={styles.description}>
                        {showFullContent ? book.content : truncatedContent}
                    </p>
                    {
                        book.content?.length > 150 && (
                            <button onClick={() => setShowFullContent(prev => !prev)} className={styles.toggleBtn}>
                                {showFullContent ? '접기' : '더보기'}
                            </button>
                        )
                    }
                </div>
            </div>

            <div className={styles.reviewSection}>
                <h3 className={styles.sectionTitle}>리뷰</h3>
                <div className={styles.reviewHeader}>
                    <span className={styles.ratingDisplay}>평점: {calculateAverageRating()}</span>
                    <button
                        className={styles.viewAllReviewsBtn}
                        onClick={() => navigate(`/books/${book.id}/reviews`)}
                    >
                        전체보기
                    </button>
                </div>
                {book.reviews && book.reviews.length > 0 ? (
                    <ul className={styles.reviewList}>
                        {book.reviews.map((r, i) => (
                            <li key={i} className={styles.reviewItem} style={{ marginBottom: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <strong className={styles.reviewNickname}>{r.nickname}</strong>
                                    <span style={{ marginLeft: '0.5rem', color: '#ffc107' }}>
                                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                    </span>
                                </div>
                                {currentUserId && (
                                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                        {currentUserId === r.userId ? (
                                            <button onClick={() => handleDeleteReview(r.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.8rem' }}>삭제</button>
                                        ) : (
                                            <button onClick={() => handleReportReview(r.id)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.8rem' }}>신고</button>
                                        )}
                                    </div>
                                )}
                                <p style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>{r.content}</p>
                                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888' }}>{r.createdAt}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noReviews}>아직 등록된 리뷰가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default BookDetail;
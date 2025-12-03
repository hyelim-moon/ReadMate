import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

import Header from '../Common/Header';
import styles from '../../assets/styles/User/MyReviews.module.css'; // CSS 모듈 임포트

const MyReviews = () => {
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchMyReviews = useCallback(async () => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/api/my-reviews', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyReviews(response.data);
        } catch (err) {
            console.error("내 리뷰 불러오기 실패:", err);
            setError('내 리뷰를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

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
            fetchMyReviews();
        } catch (err) {
            console.error('리뷰 삭제 실패:', err);
            alert('리뷰 삭제에 실패했습니다. 권한이 없거나 오류가 발생했습니다.');
        }
    };

    const handleEditReview = (reviewId) => {
        alert(`리뷰 수정 기능은 아직 구현되지 않았습니다. (Review ID: ${reviewId})`);
    };

    const renderStatus = (message) => (
        <>
            <Header />
            <div className={styles.container}>
                <p className={styles.noReviews}>{message}</p>
            </div>
        </>
    );

    if (loading) return renderStatus('로딩 중...');
    if (error) return renderStatus(error);

    return (
        <>
            <Header />
            <div className={styles.container}>
                <Link to="/mypage" className={styles.backButton}>
                    <FaArrowLeft /> 마이페이지
                </Link>
                <h1 className={styles.title}>내가 쓴 리뷰</h1>
                <div className={styles.reviewList}>
                    {myReviews.length > 0 ? (
                        myReviews.map(review => (
                            <div key={review.id} className={styles.reviewItem}>
                                <div className={styles.mainContent}>
                                    <div className={styles.header}>
                                        <span className={styles.reviewerNickname}>{review.reviewerNickname || '닉네임'}</span>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleDeleteReview(review.id)} className={styles.deleteButton}>삭제</button>
                                        </div>
                                    </div>
                                    <div className={styles.meta}>
                                        <span className={styles.rating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    </div>
                                    <div className={styles.body}>
                                        <p>{review.content}</p>
                                    </div>
                                    <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Link to={`/books/${review.bookId}`} className={styles.bookLink}>
                                    <img
                                        src={review.bookImage || 'https://via.placeholder.com/40x60?text=Book'}
                                        alt={review.bookName}
                                        className={styles.bookThumbnail}
                                    />
                                    <span className={styles.bookTitleLink}><strong>{review.bookName}</strong>에 대한 리뷰</span>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noReviews}>작성한 리뷰가 없습니다.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyReviews;
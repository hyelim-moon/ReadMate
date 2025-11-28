import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaStar, FaArrowLeft } from 'react-icons/fa'; // FaArrowLeft 아이콘 추가
import '../../styles/Service/ReviewAll.css';
import ReportModal from '../Common/ReportModal';

const ReviewAll = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [bookTitle, setBookTitle] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const reviewsPerPage = 10;
    const [currentUserId, setCurrentUserId] = useState(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTargetReviewId, setReportTargetReviewId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (token) {
            axios.get('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setCurrentUserId(response.data.id);
                console.log("ReviewAll - Current User ID:", response.data.id);
            })
            .catch(error => {
                console.error("ReviewAll - 사용자 정보 불러오기 실패:", error);
                setCurrentUserId(null);
            });
        }
    }, []);

    const fetchBookData = useCallback(() => {
        if (id) {
            axios.get(`http://localhost:8080/api/books/${id}`)
                .then(response => {
                    const book = response.data;
                    setReviews(book.reviews || []);
                    setBookTitle(book.bookName || '');
                })
                .catch(error => {
                    console.error('Error fetching book details:', error);
                });
        }
    }, [id]);

    useEffect(() => {
        fetchBookData();
    }, [fetchBookData]);

    const handleReviewSubmit = (e) => {
        e.preventDefault();

        if (newReview.trim() === '' || rating === 0) {
            alert('리뷰 내용과 별점을 모두 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        axios.post(`http://localhost:8080/api/reviews`,
            { bookId: id, content: newReview, rating: rating },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
            alert('리뷰가 성공적으로 등록되었습니다.');
            setNewReview('');
            setRating(0);
            fetchBookData();
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            alert('리뷰 작성에 실패했습니다.');
        });
    };

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
            fetchBookData();
        } catch (error) {
            console.error('리뷰 삭제 실패:', error);
            alert('리뷰 삭제에 실패했습니다. 권한이 없거나 오류가 발생했습니다.');
        }
    };

    const handleOpenReportModal = (reviewId) => {
        setReportTargetReviewId(reviewId);
        setIsReportModalOpen(true);
    };

    const handleReportSubmit = async (reviewId, reason) => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            await axios.post(`http://8080/api/reviews/${reviewId}/report`,
                { reason: reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('리뷰가 신고되었습니다. 관리자 확인 후 조치될 예정입니다.');
        } catch (error) {
            console.error('리뷰 신고 실패:', error);
            alert('리뷰 신고에 실패했습니다. 오류가 발생했습니다.');
        }
    };

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="review-all-container">
            <button
                onClick={() => navigate(`/books/${id}`)}
                className="back-to-detail-button"
            >
                <FaArrowLeft /> 책 정보
            </button>

            <h1 className="review-all-title">{bookTitle} - 전체 리뷰</h1>

            <div className="review-form-container">
                <form onSubmit={handleReviewSubmit}>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <FaStar
                                    key={ratingValue}
                                    className="star"
                                    color={ratingValue <= rating ? '#ffc107' : '#e4e5e9'}
                                    onClick={() => setRating(ratingValue)}
                                />
                            );
                        })}
                    </div>
                    <textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="리뷰를 작성해주세요"
                    />
                    <button type="submit">리뷰 등록</button>
                </form>
            </div>

            <div className="review-all-list">
                {currentReviews.length > 0 ? (
                    currentReviews.map((review) => (
                        <div key={review.id} className="review-all-item">
                            <div className="review-all-item-header">
                                <div className="review-all-item-info">
                                    <span className="review-all-item-reviewer">{review.nickname}</span>
                                    <span className="review-all-item-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                </div>
                                {currentUserId && (
                                    <div className="review-all-actions">
                                        {currentUserId === review.userId ? (
                                            <button onClick={() => handleDeleteReview(review.id)} className="deleteButton">삭제</button>
                                        ) : (
                                            <button onClick={() => handleOpenReportModal(review.id)} className="subtleReportLink">
                                                신고
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="review-all-item-body">
                                <p>{review.content}</p>
                            </div>
                            <span className="review-all-item-date">{review.createdAt}</span>
                        </div>
                    ))
                ) : (
                    <p>작성된 리뷰가 없습니다.</p>
                )}
            </div>

            {reviews.length > reviewsPerPage && (
                <div className="review-all-pagination">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        <FaChevronLeft />
                    </button>
                    {[...Array(totalPages).keys()].map(number => (
                        <button key={number + 1} onClick={() => paginate(number + 1)} className={currentPage === number + 1 ? 'active' : ''}>
                            {number + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        <FaChevronRight />
                    </button>
                </div>
            )}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                reviewId={reportTargetReviewId}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
};

export default ReviewAll;
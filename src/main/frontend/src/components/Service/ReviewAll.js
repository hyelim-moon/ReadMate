import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import '../../styles/Service/ReviewAll.css';

const ReviewAll = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [bookTitle, setBookTitle] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(0);
    const reviewsPerPage = 10;

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
            fetchBookData(); 
            setNewReview('');
            setRating(0);
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            alert('리뷰 작성에 실패했습니다.');
        });
    };

    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="review-all-container">
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
                        placeholder="리뷰를 작성해주세요..."
                    />
                    <button type="submit">리뷰 등록</button>
                </form>
            </div>

            <div className="review-all-list">
                {currentReviews.length > 0 ? (
                    currentReviews.map((review) => (
                        <div key={review.id} className="review-all-item">
                            <div className="review-all-item-header">
                                <span className="review-all-item-reviewer">{review.nickname}</span>
                                <span className="review-all-item-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                <span className="review-all-item-date">{review.createdAt}</span>
                            </div>
                            <div className="review-all-item-body">
                                <p>{review.content}</p>
                            </div>
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
        </div>
    );
};

export default ReviewAll;
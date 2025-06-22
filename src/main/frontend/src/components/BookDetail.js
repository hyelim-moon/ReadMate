import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../assets/styles/BookDetail.module.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // ❤️ 찜 아이콘

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [showFullContent, setShowFullContent] = useState(false);
    const [isWished, setIsWished] = useState(false); // 💖 찜 여부 상태

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

    // 🔹 찜 여부 확인
    useEffect(() => {
        if (!book?.id) return;

        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) return;

        axios.get(`http://localhost:8080/api/wishlist/check?bookId=${book.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setIsWished(res.data))
            .catch(err => {
                console.error("찜 여부 확인 실패:", err);
            });
    }, [book]);

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

    if (!book) return <div>로딩 중...</div>;

    const truncatedContent = book.content?.length > 100
        ? book.content.slice(0, 100) + '...'
        : book.content;

    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.left}>
                    <img src={book.bookImage} alt={book.bookName} className={styles.image}/>
                </div>
                <div className={styles.right}>
                    <h2>{book.bookName}</h2>
                    <p><strong>저자:</strong> {book.author}</p>
                    <p><strong>출판사:</strong> {book.publisher}</p>
                    <p><strong>ISBN:</strong> {book.isbn}</p>
                    <p><strong>장르:</strong> {book.genre}</p>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '1rem'}}>
                        <button onClick={toggleWishlist} className={styles.wishBtn}>
                            {isWished ? <FaHeart/> : <FaRegHeart/>}
                        </button>
                        <button
                            className={styles.recordBtn}
                            onClick={() => navigate(`/record?bookId=${book.id}`)}
                        >
                            📘 독서 기록 쓰러 가기
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.contentSection}>
                <h2>책 소개</h2>
                <div className={styles.descriptionWrapper}>
                    <p className={styles.description}>
                        {showFullContent ? book.content : truncatedContent}
                    </p>
                    {
                        book.content?.length > 100 && (
                            <button onClick={() => setShowFullContent(prev => !prev)} className={styles.toggleBtn}>
                                {showFullContent ? '접기' : '더보기'}
                            </button>
                        )
                    }
                </div>
            </div>

            <div className={styles.reviewSection}>
                <div className={styles.reviewHeader}>
                    <span>⭐ 평점: {book.rating || '등록된 평점 없음'}</span>
                    <button
                        className={styles.reviewBtn}
                        onClick={() => navigate(`/books/${book.id}/reviews`)}
                    >
                        전체보기
                    </button>
                </div>
                <ul className={styles.reviewList}>
                    {(book.reviews || []).map((r, i) => (
                        <li key={i}>
                            <strong>({r.nickname})</strong>: {r.content}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default BookDetail;

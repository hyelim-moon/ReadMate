import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/ProductDetail.module.css';

function HeartIcon({ filled }) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={filled ? "#b79240" : "none"}
            stroke="#b79240"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M12 21C12 21 5 14.5 5 9.5C5 7.01472 7.01472 5 9.5 5C10.7401 5 11.9114 5.61522 12.6667 6.58333C13.422 5.61522 14.5933 5 15.8333 5C18.3186 5 20.3333 7.01472 20.3333 9.5C20.3333 14.5 12 21 12 21Z" />
        </svg>
    );
}

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // 로그인 상태 (임시)
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 실제 로그인 상태에 따라 변경 필요

    const isAbsoluteURL = (url) => /^https?:\/\//.test(url);

    useEffect(() => {
        setLoading(true);
        setError('');
        fetch(`http://localhost:8080/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('상품을 불러올 수 없습니다.');
                return res.json();
            })
            .then(data => setProduct(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    const imageUrl = product?.image && isAbsoluteURL(product.image)
        ? product.image
        : 'https://picsum.photos/600/600';

    const toggleWishlist = () => {
        setIsWishlisted(prev => !prev);
        // API 호출 위치
    };

    const handlePurchase = () => {
        if (!isLoggedIn) {
            const confirmLogin = window.confirm(
                "회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?"
            );
            if (confirmLogin) {
                navigate('/login');
            }
            return; // 취소 시 아무 일도 안 일어남
        }
        alert(`${product.name} 상품을 구매하시겠습니까?`);
        // 구매 처리 로직 추가
    };

    return (
        <div className={styles.detailPage}>
            <div className={styles.detailContainer}>
                <div className={styles.detailHeader}>
                    <button onClick={() => navigate(-1)}>←</button>
                </div>

                {loading && <p>로딩 중...</p>}
                {error && <p style={{ color: 'red', padding: '1rem' }}>{error}</p>}

                {!loading && !error && product && (
                    <>
                        <h2 className={styles.detailTitle}>{product.name}</h2>
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className={styles.detailImage}
                        />
                        <p className={styles.detailInfo}>가격: {product.price} P</p>
                        <p className={styles.detailReview}>
                            {product.description || '상품 상세 설명이 없습니다.'}
                        </p>

                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
                                onClick={toggleWishlist}
                                aria-label={isWishlisted ? '찜 취소' : '찜하기'}
                                title={isWishlisted ? '찜 취소' : '찜하기'}
                            >
                                <HeartIcon filled={isWishlisted} />
                            </button>

                            <button
                                className={styles.purchaseBtn}
                                onClick={handlePurchase}
                            >
                                구매하기
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/ProductDetail.module.css';

function HeartIcon({ filled }) {
    console.log("ProductDetail 컴포넌트 렌더링됨");
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

function ProductDetail({ userid, isLoggedIn }) {
    console.log("userid:", userid);
    console.log("isLoggedIn:", isLoggedIn);
    const { id } = useParams(); // URL param으로 상품 ID(인덱스) 받음
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const isAbsoluteURL = (url) => /^https?:\/\//.test(url);

    // 컴포넌트 렌더링과 id 변경 시마다 데이터 fetch
    useEffect(() => {
        console.log("ProductDetail 컴포넌트 렌더링, 요청할 상품 ID:", id);
        setLoading(true);
        setError('');
        setProduct(null);

        fetch(`http://localhost:8080/api/products/kyobogiftcards/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('상품을 불러올 수 없습니다.');
                return res.json();
            })
            .then(data => {
                console.log('상품 데이터:', data);
                setProduct(data);
            })
            .catch(err => {
                console.error('상품 데이터 로드 오류:', err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const imageUrl =
        product?.image && isAbsoluteURL(product.image)
            ? product.image
            : 'https://picsum.photos/600/600';

    const toggleWishlist = async () => {
        if (!isLoggedIn) {
            alert("찜 기능은 로그인 후 이용 가능합니다.");
            return;
        }

        try {
            const productId = parseInt(id, 10);
            const url = isWishlisted
                ? `http://localhost:8080/api/wishlist/remove`
                : `http://localhost:8080/api/wishlist/add`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid, productId }),
            });

            if (!response.ok) {
                const msg = await response.text();
                alert(`찜 처리 실패: ${msg}`);
                return;
            }

            setIsWishlisted(prev => !prev);
        } catch (error) {
            alert(`찜 처리 중 오류 발생: ${error.message}`);
        }
    };

    const handlePurchase = async () => {
        console.log('로그인 상태:', isLoggedIn);
        console.log("userid:", userid);
        if (!isLoggedIn) {
            const confirmLogin = window.confirm(
                "회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?"
            );
            if (confirmLogin) {
                navigate('/login');
            }
            return;
        }

        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
            alert('상품 정보가 올바르지 않습니다.');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/points/purchase?userid=${userid}&productId=${productId}`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorMsg = await response.text();
                alert(`구매 실패: ${errorMsg}`);
                return;
            }

            alert(`${product.name} 상품 구매가 완료되었습니다!`);
            // TODO: 포인트 업데이트 등 후속 처리
        } catch (error) {
            alert(`구매 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <div className={styles.detailPage}>
            <div className={styles.detailContainer}>
                <div className={styles.detailHeader}>
                    <button onClick={() => navigate(-1)}>← 뒤로가기</button>
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
                        <p className={styles.detailInfo}>
                            가격: {(Number(product.price) * 2).toLocaleString()} P
                        </p>
                        <p className={styles.detailReview}>
                            {'상품 상세 설명이 없습니다.'}
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

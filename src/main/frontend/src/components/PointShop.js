import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/PointShop.module.css';

function PointShop({ userId }) {
    const [pointBalance, setPointBalance] = useState(0);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userId) {
                    const resPoint = await fetch(`http://localhost:8080/api/users/${userId}/points`, {
                        credentials: 'include',
                    });
                    if (!resPoint.ok) throw new Error('포인트 잔액 불러오기 실패');
                    const dataPoint = await resPoint.json();
                    setPointBalance(dataPoint.points);
                } else {
                    setPointBalance(0);
                }

                const resKyobo = await fetch('http://localhost:8080/api/products/kyobogiftcards', {
                    credentials: 'include',
                });
                if (!resKyobo.ok) throw new Error('교보문고 상품 목록 불러오기 실패');
                const dataKyobo = await resKyobo.json();
                setProducts(dataKyobo);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchData();
    }, [userId]);

    if (error) return <p style={{ color: 'red', padding: '1rem' }}>{error}</p>;

    return (
        <main className={styles.pointShopPage}>
            <div className={styles.headerContainer}>
                <h2 className={styles.pageTitle}>포인트 샵</h2>
                <div className={styles.pointBalance}>
                    현재 포인트: <strong>{pointBalance} P</strong>
                </div>
            </div>

            <div className={styles.productList}>
                {products.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>상품이 없습니다.</p>
                    </div>
                ) : (
                    products.map((product, index) => {
                        const productId = index;  // 여기서 index를 id로 사용
                        return (
                            <div
                                key={productId}
                                className={styles.productCard}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        navigate(`/products/${productId}`);
                                    }
                                }}
                                onClick={() => {
                                    navigate(`/products/${productId}`);
                                }}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={styles.productImage}
                                />
                                <h3 className={styles.productName}>{product.name}</h3>
                                <p className={styles.productPrice}>{Number(product.price) * 2} P</p>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default PointShop;

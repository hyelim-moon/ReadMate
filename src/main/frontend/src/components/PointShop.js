import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/PointShop.module.css';

function PointShop({ userId }) {
    const [pointBalance, setPointBalance] = useState(0);
    const [kyoboProducts, setKyoboProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (userId) {
                    // 포인트 불러오기
                    const resPoint = await fetch(`http://localhost:8080/api/users/${userId}/points`, {
                        credentials: 'include',
                    });
                    if (!resPoint.ok) throw new Error('포인트 잔액 불러오기 실패');
                    const dataPoint = await resPoint.json();
                    setPointBalance(dataPoint.points);
                } else {
                    setPointBalance(0);
                }

                // 교보문고 기프트카드
                const resKyobo = await fetch('http://localhost:8080/api/products/kyobogiftcards', {
                    credentials: 'include',
                });
                if (!resKyobo.ok) throw new Error('교보문고 상품 목록 불러오기 실패');
                const dataKyobo = await resKyobo.json();
                setProducts(dataKyobo);  // 여기 products에 넣기

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
                    products.map((product, index) => (
                        <div
                            key={product.name + index}
                            className={styles.productCard}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if(e.key === 'Enter') alert(`선택한 상품: ${product.name}`); }}
                            onClick={() => alert(`선택한 상품: ${product.name}`)}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className={styles.productImage}
                            />
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productPrice}>{Number(product.price) * 2} P</p>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default PointShop;

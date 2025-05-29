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
                    const resPoint = await fetch(`http://localhost:8080/api/users/${userId}/points`);
                    if (!resPoint.ok) throw new Error('포인트 잔액 불러오기 실패');
                    const dataPoint = await resPoint.json();
                    setPointBalance(dataPoint.points);
                } else {
                    setPointBalance(0);
                }

                const resProducts = await fetch('http://localhost:8080/api/points/products');
                if (!resProducts.ok) throw new Error('상품 목록 불러오기 실패');
                const dataProducts = await resProducts.json();
                setProducts(dataProducts);

            } catch (e) {
                setError(e.message);
            }
        };

        fetchData();
    }, [userId]);

    const handleBuyClick = (productId) => {
        if (!userId) {
            const confirmLogin = window.confirm('구매하려면 로그인이 필요합니다. 로그인하시겠습니까?');
            if (confirmLogin) navigate('/login');
            return;
        }

        alert(`상품 ${productId} 구매 기능은 아직 구현 중입니다.`);
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <main className={styles.pointShopPage}>
            <h2 className={styles.pageTitle}>포인트 샵</h2>
            <div className={styles.pointBalance}>
                현재 포인트: <strong>{pointBalance} P</strong>
            </div>
            <div className={styles.productList}>
                {products.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>상품이 없습니다.</p>
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <img
                                src={`http://localhost:8080${product.image}`}
                                alt={product.name}
                                className={styles.productImage}
                            />
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productPrice}>{product.price} P</p>
                            <button
                                className={styles.buyButton}
                                onClick={() => handleBuyClick(product.id)}
                            >
                                구매하기
                            </button>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default PointShop;

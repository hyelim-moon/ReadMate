import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/PointShop.module.css';

function PointShop({ userId }) {
    const [pointBalance, setPointBalance] = useState(0);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category === selectedCategory ? null : category);
    };

    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products;


    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("ACCESS_TOKEN");
          if (!token) {
            setPointBalance(0);
            return;
          }

          const resPoint = await fetch('http://localhost:8080/api/points/my', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!resPoint.ok) throw new Error('포인트 잔액 불러오기 실패');
          const dataPoint = await resPoint.json();
          console.log('포인트 API 응답:', dataPoint);
          setPointBalance(dataPoint);

          const resProducts = await fetch('http://localhost:8080/api/products', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!resProducts.ok) throw new Error('상품 목록 불러오기 실패');
          const dataProducts = await resProducts.json();

          const dataWithCategory = dataProducts.map((product) => ({
            ...product,
            category: product.name.includes('교보문고') ? '교보문고' : '밀리의 서재',
          }));
          setProducts(dataWithCategory);

        } catch (e) {
          setError(e.message);
        }
      };

      fetchData();
    }, [userId]);

    if (error) return <p style={{ color: 'red', padding: '1rem' }}>{error}</p>;

    return (
            <main className={styles.pointShopPage}>
                <section className={styles.mainContent}>
                    <div className={styles.headerContainer}>
                        <h2 className={styles.pageTitle}>포인트 샵</h2>
                        <div className={styles.pointBalance}>
                            현재 포인트: <strong>{pointBalance} P</strong>
                        </div>
                    </div>

                    <div className={styles.productList}>
                        {products.length === 0 ? (
                            <div className={styles.nothing}>
                                <p className={styles.emptyMessage}>현재 이용 가능한 상품이 없습니다.</p>
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className={styles.productCard}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigate(`/products/${product.id}`);
                                        }
                                    }}
                                    onClick={() => navigate(`/products/${product.id}`)}
                                    aria-label={`${product.name} 상품 상세 보기`}
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
                </section>

                <div className={styles.sidebarRight}>
                    <h3>카테고리</h3>
                    <div
                        className={`${styles.categoryItem} ${selectedCategory === null ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        전체 보기
                    </div>

                    <div
                        className={`${styles.categoryItem} ${selectedCategory === '교보문고' ? styles.active : ''}`}
                        onClick={() => handleCategoryClick('교보문고')}
                    >
                        교보문고
                    </div>
                    <div
                        className={`${styles.categoryItem} ${selectedCategory === '밀리의 서재' ? styles.active : ''}`}
                        onClick={() => handleCategoryClick('밀리의 서재')}
                    >
                        밀리의 서재
                    </div>
                </div>
            </main>
        );
}

export default PointShop;

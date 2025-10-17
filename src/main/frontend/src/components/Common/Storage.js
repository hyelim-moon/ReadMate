import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/Storage.module.css';

function Storage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('available');

  useEffect(() => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    axios.get('http://localhost:8080/api/purchases', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPurchases(res.data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, []);

  const filteredPurchases = purchases.filter(p =>
    filter === 'available' ? p.status !== '사용완료' : p.status === '사용완료'
  );

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>에러: {error}</p>;

  return (
      <div className={styles.storage}>
        <h2>보관함</h2>

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${filter === 'available' ? styles.active : ''}`}
            onClick={() => setFilter('available')}
          >
            사용 가능
          </button>
          <button
            className={`${styles.toggleButton} ${filter === 'used' ? styles.active : ''}`}
            onClick={() => setFilter('used')}
          >
            사용 완료
          </button>
        </div>

        {filteredPurchases.length === 0 ? (
          <p>해당 항목이 없습니다.</p>
        ) : (
          <div className={styles.cardContainer}>
            {filteredPurchases.map(p => (
              <div key={p.id} className={styles.card}>
                <h3>{p.productName}</h3>
                <p>구매일: {new Date(p.purchaseDate).toLocaleDateString()}</p>
                <p>가격: {p.price.toLocaleString()}원</p>
                <p>포인트 사용: {p.pointsUsed.toLocaleString()}P</p>
                <p className={`${styles.status} ${p.status === '사용완료' ? styles.used : styles.available}`}>
                  {p.status === '사용완료' ? '사용 완료' : '사용 가능'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
}

export default Storage;

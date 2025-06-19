import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/PurchaseHistory.module.css';

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState('desc');


  useEffect(() => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    axios.get('http://localhost:8080/api/purchases', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPurchases(res.data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    const newOrder = (key === sortKey && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const sortedPurchases = [...purchases].sort((a, b) => {
    if (!sortKey) return 0;

    let aVal = a[sortKey];
    let bVal = b[sortKey];

    // 날짜 정렬
    if (sortKey === 'purchaseDate') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>에러: {error}</p>;

  const getArrow = (key) => {
    if (sortKey !== key) return '';
    return sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className={styles.container}>
      <h2>구매 내역</h2>
      {purchases.length === 0 ? (
        <p>구매한 상품이 없습니다.</p>
      ) : (
        <table className={styles.purchaseTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('productName')}>상품명{getArrow('productName')}</th>
              <th onClick={() => handleSort('purchaseDate')}>구매일{getArrow('purchaseDate')}</th>
              <th onClick={() => handleSort('price')}>가격{getArrow('price')}</th>
              <th onClick={() => handleSort('pointsUsed')}>사용 포인트{getArrow('pointsUsed')}</th>
              <th onClick={() => handleSort('status')}>상태{getArrow('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedPurchases.map(p => (
              <tr key={p.id}>
                <td>{p.productName}</td>
                <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                <td>{p.price.toLocaleString()} P</td>
                <td>{p.pointsUsed.toLocaleString()} P</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PurchaseHistory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/PurchaseHistory.module.css';

function PurchaseHistory() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        axios.get('http://localhost:8080/api/purchases/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(({ data }) => {
            setPurchases(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('ACCESS_TOKEN');
                window.location.href = '/login';
            }
        });
    }, []);

    if (loading) return <p>로딩 중...</p>;

    return (
        <div className={styles.container}>
            <h2>구매 내역</h2>
            {purchases.length === 0 ? (
                <p>구매한 상품이 없습니다.</p>
            ) : (
                <table className={styles.purchaseTable}>
                    <thead>
                        <tr>
                            <th>상품명</th>
                            <th>구매일</th>
                            <th>가격</th>
                            <th>사용 포인트</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(p => (
                            <tr key={p.id}>
                                <td>{p.productName}</td>
                                <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                                <td>{p.price.toLocaleString()} 원</td>
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

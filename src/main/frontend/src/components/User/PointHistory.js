import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/PointHistory.module.css';

function PointHistory() {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            setError('로그인이 필요합니다.');
            return;
        }

        axios.get('http://localhost:8080/api/point-history', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setHistory(response.data);
        })
        .catch(err => {
            console.error('포인트 내역 조회 실패:', err);
            setError('포인트 내역을 불러오는 데 실패했습니다.');
        });
    }, []);

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>포인트 내역</h1>
            {history.length === 0 ? (
                <p>포인트 적립/사용 내역이 없습니다.</p>
            ) : (
                <ul className={styles.historyList}>
                    {history.map(item => (
                        <li key={item.id} className={styles.historyItem}>
                            <div className={styles.details}>
                                <span className={styles.reason}>{item.reason}</span>
                                <span className={styles.date}>
                                    {new Date(item.transactionDate).toLocaleString()}
                                </span>
                            </div>
                            <div className={`${styles.amount} ${item.amount > 0 ? styles.plus : styles.minus}`}>
                                {item.amount > 0 ? `+${item.amount}` : item.amount}P
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PointHistory;

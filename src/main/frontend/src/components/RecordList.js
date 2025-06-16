import React, { useEffect, useState, useRef } from 'react';
import styles from '../assets/styles/RecordList.module.css';
import RecordButton from '../components/RecordButton';
import { useNavigate } from 'react-router-dom';

function RecordList() {
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();
    const hasPrompted = useRef(false); // 확인창 중복 방지

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');

        if (!token || token === 'undefined' || token === '') {
            if (!hasPrompted.current) {
                hasPrompted.current = true;
                const shouldLogin = window.confirm(
                    '로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?'
                );
                if (shouldLogin) {
                    navigate('/login');
                }
            }
            return;
        }

        const fetchRecords = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/records', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('데이터 불러오기 실패');
                }
                const data = await response.json();
                setRecords(data);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            }
        };

        fetchRecords();
    }, [navigate]);

    const handleCardClick = (id) => {
        navigate(`/record/${id}`);
    };

    return (
        <main className={styles.recordListPage}>
            <h2 className={styles.pageTitle}>독서 기록 목록</h2>

            <div className={styles.recordListContainer}>
                {records.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>독서 기록 정보가 없습니다.</p>
                    </div>
                ) : (
                    records.map((record) => (
                        <div
                            key={record.id}
                            className={styles.recordCard}
                            onClick={() => handleCardClick(record.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {record.photo && (
                                <img
                                    src={`http://localhost:8080${record.photo}`}
                                    alt={`${record.title} 책 이미지`}
                                    className={styles.recordImage}
                                />
                            )}
                            <div className={styles.recordContent}>
                                <h3 className={styles.recordTitle}>{record.title}</h3>
                                <div className={styles.recordInfo}>
                                    <p className={styles.recordAuthor}><strong>저자:</strong> {record.author}</p>
                                    <p className={styles.recordPublisher}><strong>출판사:</strong> {record.publisher}</p>
                                    <p className={styles.recordGenre}><strong>장르:</strong> {record.genre}</p>
                                </div>
                                <p className={styles.reviewExcerpt}>
                                    {record.content.length > 120
                                        ? `${record.content.slice(0, 120)}...`
                                        : record.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <RecordButton />
        </main>
    );
}

export default RecordList;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/RecordList.module.css';

function RecordList() {
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();

    const handleWriteClick = () => {
        navigate('/record');
    };

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/records');
                const data = await response.json();
                setRecords(data);
            } catch (error) {
                console.error('데이터 로딩 실패:', error);
            }
        };

        fetchRecords();
    }, []);

    return (
        <main className={styles.main}>
            <h2 className={styles.pageTitle}>독서 기록 목록</h2>

            <div className={styles.recordList}>
                {records.length === 0 ? (
                    <p className={styles.emptyMessage}>독서 기록 정보가 없습니다😢</p>
                ) : (
                    records.map((record) => (
                        <div key={record.id} className={styles.recordCard}>
                            {record.photoUrl && (
                                <img
                                    src={record.photoUrl}
                                    alt={`${record.title} 책 이미지`}
                                    className={styles.recordImage}
                                />
                            )}
                            <div className={styles.recordContent}>
                                <h3 className={styles.recordTitle}>{record.title}</h3>
                                <p className={styles.recordAuthor}><strong>저자:</strong> {record.author}</p>
                                <p className={styles.reviewExcerpt}>{record.review.slice(0, 120)}...</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button onClick={handleWriteClick} className={styles.writeBtn}>글쓰기</button>
        </main>
    );
}

export default RecordList;
import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/RecordList.module.css';
import RecordButton from '../components/RecordButton';  // RecordButton 컴포넌트 임포트
import { useNavigate } from 'react-router-dom';

function RecordList() {
    const [records, setRecords] = useState([]);
    const navigate = useNavigate();

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

    const handleWriteClick = () => {
        navigate('/record');
    };

    return (
        <main className={styles.recordListPage}>
            <h2 className={styles.pageTitle}>독서 기록 목록</h2>

            <div className={styles.recordListContainer}>
                {records.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>독서 기록 정보가 없습니다 😢</p>
                    </div>
                ) : (
                    records.map((record) => (
                        <div key={record.id} className={styles.recordCard}>
                            {record.photo && (
                                <img
                                    src={`http://localhost:8080${record.photo}`}  // 이미지 URL 변경
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
                                    {record.review.length > 120 ? `${record.review.slice(0, 120)}...` : record.review}
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

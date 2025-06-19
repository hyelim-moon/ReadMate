import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/RecordDetail.module.css';
import { useParams, useNavigate } from 'react-router-dom';

function RecordDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecord = async () => {
            if (!id) {
                setError('잘못된 ID입니다.');
                return;
            }

            try {
              const token = localStorage.getItem('ACCESS_TOKEN');
              console.log('ACCESS_TOKEN:', token);
              console.log('Authorization header:', token ? `Bearer ${token}` : '없음');
              const res = await fetch(`http://localhost:8080/api/records/${id}`, {
                headers: {
                  Authorization: token ? `Bearer ${token}` : '',
                },
              });
              if (!res.ok) throw new Error("데이터 없음");
              const data = await res.json();
              setRecord(data);
            } catch (err) {
              console.error('불러오기 실패', err);
              setError('데이터를 불러오는 중 오류가 발생했습니다.');
            }
        };

        fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            const token = localStorage.getItem('ACCESS_TOKEN');
            const res = await fetch(`http://localhost:8080/api/records/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            });
            if (!res.ok) throw new Error('삭제 실패');
            alert('삭제되었습니다.');
            navigate('/recordlist');
        } catch (err) {
            console.error('삭제 실패', err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };


    const handleEdit = () => {
        navigate(`/record/edit/${id}`);
    };

    if (error) return <p>{error}</p>;
    if (!record) return <p>불러오는 중...</p>;

    return (
        <main className={styles.detailPage}>
            <div className={styles.detailContainer}>
                <div className={styles.detailHeader}>
                    <h2 className={styles.detailTitle}>{record.title}</h2>
                    <div className={styles.buttonGroup}>
                        <button onClick={handleEdit} className={styles.editButton}>수정</button>
                        <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
                    </div>
                </div>
                <p className={styles.detailInfo}><strong>저자:</strong> {record.author}</p>
                <p className={styles.detailInfo}><strong>출판사:</strong> {record.publisher}</p>
                <p className={styles.detailInfo}><strong>장르:</strong> {record.genre}</p>
                <p className={styles.detailReview}><strong>감상문:</strong> {record.content}</p>
                {record.photo && (
                    <img
                        src={`http://localhost:8080${record.photo}`}
                        alt="책 이미지"
                        className={styles.detailImage}
                    />
                )}
            </div>
        </main>
    );
}

export default RecordDetail;

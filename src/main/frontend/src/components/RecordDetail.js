import React, { useEffect, useState } from 'react';
import styles from '../assets/styles/RecordDetail.module.css';
import { useParams, useNavigate } from 'react-router-dom';

function RecordDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [error, setError] = useState(null); // 오류 상태 추가

    useEffect(() => {
        const fetchRecord = async () => {
            if (!id) {
                setError('잘못된 ID입니다.');
                return;
            }

            try {
                const res = await fetch(`http://localhost:8080/api/records/${id}`);
                if (!res.ok) throw new Error("데이터 없음"); // 응답이 200이 아닌 경우 오류 처리
                const data = await res.json();
                setRecord(data);
            } catch (err) {
                console.error('불러오기 실패', err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.'); // 오류 메시지 설정
            }
        };

        fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            await fetch(`http://localhost:8080/api/records/${id}`, {
                method: 'DELETE',
            });
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

    if (error) return <p>{error}</p>;  // 오류 발생 시 오류 메시지 표시
    if (!record) return <p>불러오는 중...</p>;

    return (
        <main className={styles.detailPage}>
            <div className={styles.detailContainer}>
                <h2 className={styles.detailTitle}>{record.title}</h2>
                <p className={styles.detailInfo}><strong>저자:</strong> {record.author}</p>
                <p className={styles.detailInfo}><strong>출판사:</strong> {record.publisher}</p>
                <p className={styles.detailInfo}><strong>장르:</strong> {record.genre}</p>
                <p className={styles.detailReview}><strong>리뷰:</strong> {record.review}</p>
                {record.photo && (
                    <img
                        src={`http://localhost:8080${record.photo}`}
                        alt="책 이미지"
                        className={styles.detailImage}
                    />
                )}
                <div className={styles.buttonGroup}>
                    <button onClick={handleEdit} className={styles.editButton}>수정</button>
                    <button onClick={handleDelete} className={styles.deleteButton}>삭제</button>
                </div>
            </div>
        </main>
    );
}

export default RecordDetail;

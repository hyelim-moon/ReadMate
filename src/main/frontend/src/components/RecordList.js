import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/RecordList.module.css';

function RecordList() {
    const [records, setRecords] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null); // 드롭다운 메뉴 영역 참조

    const handleWriteClick = () => {
        navigate('/record');
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('정말로 이 글을 삭제하시겠습니까?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/records/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRecords(prev => prev.filter(record => record.id !== id));
                setOpenMenuId(null); // 삭제 후 메뉴 닫기
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('삭제 에러:', error);
        }
    };

    const handleEdit = (id) => {
        navigate(`/record/edit/${id}`);
    };

    const toggleMenu = (id) => {
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            <div className={styles.cardHeader} ref={menuRef}>
                                <button
                                    className={styles.menuButton}
                                    onClick={() => toggleMenu(record.id)}
                                >
                                    ⋯
                                </button>
                                {openMenuId === record.id && (
                                    <div className={styles.dropdownMenu}>
                                        <button onClick={() => handleEdit(record.id)}>수정</button>
                                        <button onClick={() => handleDelete(record.id)}>삭제</button>
                                    </div>
                                )}
                            </div>

                            {record.photo && (
                                <img
                                    src={record.photo}
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
        </main>
    );
}

export default RecordList;

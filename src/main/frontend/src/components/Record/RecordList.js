import React, { useEffect, useState, useRef } from 'react';
import styles from '../../assets/styles/RecordList.module.css';
import RecordButton from './RecordButton';
import { useNavigate } from 'react-router-dom';

function RecordList() {
    const [records, setRecords] = useState([]);
    const [sortBy, setSortBy] = useState('latest'); // 기본 정렬 기준: 최신순
    const [selectedRecords, setSelectedRecords] = useState(new Set()); // 선택된 기록 ID들을 저장
    const navigate = useNavigate();
    const hasPrompted = useRef(false); // 확인창 중복 방지

    const fetchRecords = async () => {
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

        try {
            const response = await fetch(`http://localhost:8080/api/records?sortBy=${sortBy}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('데이터 불러오기 실패');
            }
            const data = await response.json();
            setRecords(data);
            setSelectedRecords(new Set()); // 기록을 새로 불러오면 선택된 기록 초기화
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [navigate, sortBy]); // sortBy가 변경될 때마다 fetchRecords 재실행

    const handleCardClick = (id) => {
        navigate(`/record/${id}`);
    };

    const handleCheckboxChange = (recordId) => {
        setSelectedRecords(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(recordId)) {
                newSelected.delete(recordId);
            } else {
                newSelected.add(recordId);
            }
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedRecords.size === records.length) {
            // 모두 선택되어 있으면 모두 해제
            setSelectedRecords(new Set());
        } else {
            // 모두 선택되어 있지 않으면 모두 선택
            const allRecordIds = new Set(records.map(record => record.id));
            setSelectedRecords(allRecordIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedRecords.size === 0) {
            alert('삭제할 기록을 선택해주세요.');
            return;
        }

        if (!window.confirm(`${selectedRecords.size}개의 기록을 정말 삭제하시겠습니까?`)) {
            return;
        }

        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            const response = await fetch('http://localhost:8080/api/records/batch', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(Array.from(selectedRecords)), // Set을 배열로 변환하여 전송
            });

            if (!response.ok) {
                throw new Error('선택된 기록 삭제 실패');
            }

            alert('선택된 기록이 삭제되었습니다.');
            fetchRecords(); // 기록 목록 새로고침
        } catch (error) {
            console.error('기록 삭제 실패:', error);
            alert('기록 삭제 중 오류가 발생했습니다.');
        }
    };

    const isAllSelected = records.length > 0 && selectedRecords.size === records.length;
    const isIndeterminate = selectedRecords.size > 0 && selectedRecords.size < records.length;

    return (
        <main className={styles.recordListPage}>
            <h2 className={styles.pageTitle}>독서 기록 목록</h2>

            <div className={styles.controlsContainer} style={{ justifyContent: selectedRecords.size > 0 ? 'space-between' : 'flex-end' }}>
                {selectedRecords.size > 0 && (
                    <div className={styles.leftControls}>
                        <input
                            type="checkbox"
                            className={styles.selectAllCheckbox}
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            ref={el => el && (el.indeterminate = isIndeterminate)}
                            disabled={records.length === 0}
                        />
                        <label htmlFor="select-all-checkbox" className={styles.selectAllLabel}>전체 선택</label>
                        <button
                            className={styles.deleteSelectedButton}
                            onClick={handleDeleteSelected}
                            disabled={selectedRecords.size === 0}
                        >
                            선택 삭제 ({selectedRecords.size})
                        </button>
                    </div>
                )}
                <div className={styles.rightControls}>
                    <div className={styles.sortContainer}>
                        <label htmlFor="sort-select" className={styles.sortLabel}>정렬:</label>
                        <select
                            id="sort-select"
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="latest">최신순</option>
                            <option value="oldest">오래된순</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.recordListContainer}>
                {records.length === 0 ? (
                    <div className={styles.nothing}>
                        <p className={styles.emptyMessage}>독서 기록 정보가 없습니다.</p>
                    </div>
                ) : (
                    records.map((record) => (
                        <div
                            key={record.id}
                            className={`${styles.recordCard} ${selectedRecords.has(record.id) ? styles.selected : ''}`}
                        >
                            <input
                                type="checkbox"
                                className={styles.recordCheckbox}
                                checked={selectedRecords.has(record.id)}
                                onChange={() => handleCheckboxChange(record.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {record.photo && (
                                <img
                                    src={`http://localhost:8080${record.photo}`}
                                    alt={`${record.title} 책 이미지`}
                                    className={styles.recordImage}
                                    onClick={() => handleCardClick(record.id)}
                                />
                            )}
                            <div className={styles.recordContent} onClick={() => handleCardClick(record.id)}>
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
                            <p className={styles.recordDate}>
                                {new Date(record.recordDate).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                }).replace(/\. /g, '.').replace(/\.$/, '')}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <RecordButton />
        </main>
    );
}

export default RecordList;

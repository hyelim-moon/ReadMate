import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/EditMyBook.module.css';
import { FaStar, FaHeart } from 'react-icons/fa';

function EditMyBook({ book, onClose, onSave }) {
    const [formData, setFormData] = useState({
        currentPage: book.currentPage,
        startedAt: book.startedAt || '',
        finishedAt: book.finishedAt || '',
        score: book.score || 0,
        wishScore: book.wishScore || 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('ACCESS_TOKEN');
        try {
            await axios.post(`http://localhost:8080/api/saved-books/${book.id}/update`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('책 정보가 수정되었습니다.');
            onSave();
        } catch (error) {
            console.error('책 정보 수정 실패:', error);
            alert('책 정보 수정 중 오류가 발생했습니다.');
        }
    };

    const renderRating = (name, value, Icon) => (
        <div className={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={ratingValue}>
                        <input
                            type="radio"
                            name={name}
                            value={ratingValue}
                            onClick={() => handleRatingChange(name, ratingValue)}
                            style={{ display: 'none' }}
                        />
                        <Icon
                            className={styles.ratingIcon}
                            color={ratingValue <= value ? '#ffc107' : '#e4e5e9'}
                            size={30}
                        />
                    </label>
                );
            })}
        </div>
    );

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2 className={styles.pageTitle}>'{book.bookTitle}' 정보 수정</h2>
                <form onSubmit={handleSubmit} className={styles.editForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="currentPage">현재 페이지</label>
                        <div className={styles.pageInputContainer}>
                            <input
                                type="number"
                                id="currentPage"
                                name="currentPage"
                                value={formData.currentPage}
                                onChange={handleChange}
                                max={book.totalPages}
                                min="0"
                            />
                            <span className={styles.totalPages}>/ {book.totalPages}</span>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="startedAt">독서 시작일</label>
                        <input
                            type="date"
                            id="startedAt"
                            name="startedAt"
                            value={formData.startedAt}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="finishedAt">독서 완료일</label>
                        <input
                            type="date"
                            id="finishedAt"
                            name="finishedAt"
                            value={formData.finishedAt}
                            onChange={handleChange}
                        />
                    </div>

                    {book.progress > 0 ? (
                        <div className={styles.formGroup}>
                            <label>독서 만족도</label>
                            {renderRating('score', formData.score, FaStar)}
                        </div>
                    ) : (
                        <div className={styles.formGroup}>
                            <label>읽고 싶은 마음</label>
                            {renderRating('wishScore', formData.wishScore, FaHeart)}
                        </div>
                    )}

                    <div className={styles.actionButtons}>
                        <button type="submit" className={styles.saveButton}>저장</button>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditMyBook;

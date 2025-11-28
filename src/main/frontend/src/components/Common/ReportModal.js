import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import styles from '../../assets/styles/ReportModal.module.css';

const reportReasons = [
    "선택하세요", // 기본값
    "부적절한 내용 (욕설, 비방 등)",
    "스팸/광고",
    "허위 사실 유포",
    "개인 정보 침해",
    "기타"
];

const ReportModal = ({ isOpen, onClose, reviewId, onSubmit }) => {
    const [selectedReason, setSelectedReason] = useState(reportReasons[0]); // 드롭다운 선택값
    const [otherReason, setOtherReason] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedReason(reportReasons[0]);
            setOtherReason('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (selectedReason === reportReasons[0] && otherReason.trim() === '') {
            alert('신고 사유를 선택하거나 입력해주세요.');
            return;
        }

        let finalReason = selectedReason;
        if (selectedReason === "기타" && otherReason.trim() !== '') {
            finalReason += (finalReason ? ' - ' : '') + otherReason.trim();
        } else if (selectedReason !== reportReasons[0] && otherReason.trim() !== '') {
            // '선택하세요'가 아닌 다른 사유를 선택하고 상세 사유 텍스트박스에 입력했을 경우
            finalReason += ' (상세: ' + otherReason.trim() + ')';
        } else if (selectedReason === reportReasons[0] && otherReason.trim() !== '') {
            // 드롭다운에서 아무것도 선택 안 하고 기타 사유만 입력했을 경우
            finalReason = otherReason.trim();
        }

        onSubmit(reviewId, finalReason);
        onClose();
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.reportModalOverlay}>
            <div className={styles.reportModalContent}>
                <h2>리뷰 신고</h2>
                <p>신고 사유를 선택해주세요:</p>
                <select
                    className={styles.reasonDropdown}
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                >
                    {reportReasons.map(reason => (
                        <option key={reason} value={reason} disabled={reason === "선택하세요"}>
                            {reason}
                        </option>
                    ))}
                </select>

                {selectedReason !== reportReasons[0] && ( // '선택하세요'가 아닐 때 텍스트 박스 표시
                    <textarea
                        placeholder={selectedReason === "기타" ? "기타 사유를 입력해주세요." : "상세 사유를 입력해주세요."}
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className={styles.otherReasonTextarea}
                    />
                )}
                <div className={styles.modalActions}>
                    <button onClick={handleSubmit} className={styles.submitButton}>신고</button>
                    <button onClick={onClose} className={styles.cancelButton}>취소</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReportModal;
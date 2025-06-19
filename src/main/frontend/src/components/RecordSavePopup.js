import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/RecordSavePopup.module.css';

function RecordSavePopup({ message, onClose }) {
    const navigate = useNavigate();

    const handleClose = () => {
        onClose();          // 팝업 닫기 동작 실행
        navigate('/recordlist');  // recordlist 경로로 이동
    };

    return (
        <div className={styles.popupOverlay} onClick={handleClose}>
            <div className={styles.popup} onClick={e => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={handleClose}>확인</button>
            </div>
        </div>
    );
}

export default RecordSavePopup;

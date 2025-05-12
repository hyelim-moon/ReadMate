import React from 'react';
import styles from '../assets/styles/RecordSavePopup.module.css';

function RecordSavePopup({ message, onClose }) {
    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popup}>
                <p>{message}</p>
                <button onClick={onClose}>확인</button>
            </div>
        </div>
    );
}

export default RecordSavePopup;

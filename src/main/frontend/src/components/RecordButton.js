import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/RecordButton.module.css';

function RecordButton() {
    return (
        <Link to="/record">
            <button className={styles.floatingBtn}>글쓰기</button>
        </Link>
    );
}

export default RecordButton;

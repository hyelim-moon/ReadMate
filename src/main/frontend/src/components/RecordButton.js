import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/RecordButton.module.css';  // CSS 모듈 파일 임포트

function RecordButton() {
    return (
        <Link to="/record">
            <button className={styles.floatingBtn}>글쓰기</button>  {/* floatingBtn 클래스 적용 */}
        </Link>
    );
}

export default RecordButton;
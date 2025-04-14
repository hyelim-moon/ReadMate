import styles from '../assets/styles/Record.module.css';

function RecordNothing() {
    return (
        <div className={styles.nothing}>
            <h1>독서 기록 정보가 없습니다😢</h1>
        </div>
    );
}

export default RecordNothing; // ✅ 꼭 default로 expo
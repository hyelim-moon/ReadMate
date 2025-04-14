import styles from '../assets/styles/Record.module.css';

function Record() {
    return (
        <div>
            <button className={styles.writeBtn}>글쓰기</button>
        </div>
    );
}

export default Record; // ✅ 꼭 default로 expo
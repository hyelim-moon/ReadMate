import styles from '../assets/styles/Record.module.css';
import Banner from "./Banner";

function Record() {
    return (
        <main className={styles.main}>
            <Banner type="ranking" text="독서기록" />
            <Banner type="recommend" text="독서기록" />
            <Banner type="recommend" text="독서기록" />
            <div>
                <button className={styles.writeBtn}>글쓰기</button>
            </div>
        </main>
    );
}

export default Record; // ✅ 꼭 default로 expo
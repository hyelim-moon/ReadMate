import { useNavigate } from 'react-router-dom';
import styles from '../assets/styles/RecordList.module.css';
import Banner from "./Banner";

function RecordList() {
    const navigate = useNavigate();

    const handleWriteClick = () => {
        navigate('/record'); // 이 경로로 이동
    };
    return (
        <main className={styles.main}>
            <Banner type="ranking" text="독서기록" />
            <Banner type="recommend" text="독서기록" />
            <Banner type="recommend" text="독서기록" />
            <div>
                <button onClick={handleWriteClick} className={styles.writeBtn}>글쓰기</button>
            </div>
        </main>
    );
}

export default RecordList; // ✅ 꼭 default로 expo
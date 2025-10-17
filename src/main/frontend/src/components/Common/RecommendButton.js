import { Link } from 'react-router-dom';
import styles from '../../assets/styles/RecommendButton.module.css';

function RecommendButton() {
    return (
        <Link to="/chat">
            <button className={styles.floatingBtn}>독서 추천</button>
        </Link>
    );
}

export default RecommendButton;

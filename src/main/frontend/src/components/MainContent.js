import Banner from './Banner';
import styles from '../assets/styles/MainContent.module.css';

function MainContent() {
    return (
        <main className={styles.main}>
            <Banner type="ranking" text="랭킹 책 광고 배너" />
            <Banner type="recommend" text="추천 책 광고 배너" />
        </main>
    );
}

export default MainContent;

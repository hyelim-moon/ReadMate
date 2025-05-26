import Banner from './Banner';
import styles from '../assets/styles/MainContent.module.css';

function MainContent() {
    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <h2 className={styles.title}>베스트셀러</h2>
                <Banner type="bestseller" />
            </section>

            <section className={styles.section}>
                <h2 className={styles.title}>에디터 추천</h2>
                <Banner type="picks" />
            </section>
        </main>
    );
}

export default MainContent;

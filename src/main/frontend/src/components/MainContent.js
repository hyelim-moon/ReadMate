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
                <h2 className={styles.title}>신작추천</h2>
                <Banner type="newbest" />
            </section>
        </main>
    );
}

export default MainContent;

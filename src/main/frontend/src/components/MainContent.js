import Banner from './Banner';
import styles from '../assets/styles/MainContent.module.css';
import { LuSparkles } from "react-icons/lu";
import { BiBulb } from "react-icons/bi";
import { FaRegLightbulb } from "react-icons/fa6";

function MainContent() {
    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <h2 className={styles.title}>
                    <LuSparkles  className={styles.icon} /> 베스트셀러</h2>
                <Banner type="bestseller" />
            </section>

            <section className={styles.section}>
                <h2 className={styles.title}>
                    <FaRegLightbulb className={styles.icon} /> 에디터 추천</h2>
                <Banner type="picks" />
            </section>
        </main>
    );
}

export default MainContent;

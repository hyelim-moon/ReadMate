import React, { useState } from 'react';
import Banner from './Banner';
import styles from '../assets/styles/MainContent.module.css';
import { FaCrown } from 'react-icons/fa';
import { FaRegLightbulb } from "react-icons/fa6";

function MainContent() {
    const [selectedCategory, setSelectedCategory] = useState('소설');
    const categories = ['소설', '시/에세이', '경제/경영', '자기계발', '인문'];

    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <h2 className={styles.title}>
                    <FaCrown className={styles.icon} /> 베스트셀러
                </h2>
                <Banner type="bestseller" />
            </section>

            <section className={styles.section}>
                <h2 className={styles.title}>
                    <FaRegLightbulb className={styles.icon} /> 신작추천
                </h2>
                <div className={styles.categoryToggle}>
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <Banner type="newbest" category={selectedCategory} />
            </section>
        </main>
    );
}

export default MainContent;

import React, { useState } from 'react';
import Banner from './Banner';
import styles from '../../assets/styles/MainContent.module.css';
import { FaCrown } from 'react-icons/fa';
import { FaRegLightbulb } from "react-icons/fa6";

/**
 * 홈 메인 섹션
 * - 베스트셀러 / 신작 각각 별도 카테고리 상태
 */
function MainContent() {
    const [selectedBestCategory, setSelectedBestCategory] = useState('전체');
    const [selectedNewCategory, setSelectedNewCategory] = useState('전체');

    const categories = ['전체', '소설', '시/에세이', '경제/경영', '자기계발', '인문'];

    return (
        <main className={styles.main}>
            {/* 베스트셀러 */}
            <section className={styles.section}>
                <h2 className={styles.title}>
                    <FaCrown className={styles.icon} /> 베스트셀러
                </h2>

                <div className={styles.categoryWrap}>
                    {categories.map((category) => (
                        <button
                            key={`best-${category}`}
                            className={`${styles.categoryButton} ${selectedBestCategory === category ? styles.active : ''}`}
                            onClick={() => setSelectedBestCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <Banner
                    type="bestseller"
                    limit={40}
                    hideSubtitle
                    category={selectedBestCategory}
                />
            </section>

            {/* 신작 */}
            <section className={styles.section}>
                <h2 className={styles.title}>
                    <FaRegLightbulb className={styles.icon} /> 신작추천
                </h2>

                <div className={styles.categoryWrap}>
                    {categories.map((category) => (
                        <button
                            key={`new-${category}`}
                            className={`${styles.categoryButton} ${selectedNewCategory === category ? styles.active : ''}`}
                            onClick={() => setSelectedNewCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <Banner
                    type="newbest"
                    limit={40}
                    hideSubtitle
                    category={selectedNewCategory}
                />
            </section>
        </main>
    );
}

export default MainContent;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/Book/GenreList.module.css';

// 화면에 보여줄 장르 버튼 목록
const GENRES = [
    '소설',
    '시-에세이',   // 시/희곡 + 에세이 묶음
    '경제/경영',
    '자기계발',
    '인문',
    '전체',
];

function GenreList() {
    const [genreImages, setGenreImages] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 모든 책 한 번만 받아와서 장르 카드용 대표 이미지 뽑기
        axios
            .get('http://localhost:8080/api/books')
            .then((response) => {
                const books = response.data || [];
                const images = {};

                // ✅ 각 장르별 대표 이미지 선정
                GENRES.forEach((genreLabel) => {
                    // "전체" 는 아래에서 따로 처리
                    if (genreLabel === '전체') return;

                    let candidate = null;

                    if (genreLabel === '소설') {
                        // 장르에 '소설' 이 포함된 책 아무거나
                        candidate = books.find(
                            (b) => b.genre && b.genre.includes('소설')
                        );
                    } else if (genreLabel === '시-에세이') {
                        // 시/희곡 또는 에세이
                        candidate = books.find(
                            (b) =>
                                b.genre === '시/희곡' ||
                                b.genre === '에세이'
                        );
                    } else {
                        // 나머지는 장르 정확히 일치
                        candidate = books.find(
                            (b) => b.genre === genreLabel
                        );
                    }

                    if (candidate && candidate.bookImage) {
                        images[genreLabel] = candidate.bookImage;
                    }
                });

                // ✅ "전체" 카드용 대표 이미지: 그냥 첫 번째 이미지를 가진 책 사용
                const anyBookWithImage = books.find(
                    (b) => b.bookImage && b.bookImage.trim() !== ''
                );
                if (anyBookWithImage) {
                    images['전체'] = anyBookWithImage.bookImage;
                }

                setGenreImages(images);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error loading books for genre thumbnails:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>도서 장르 선택</h1>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>도서 장르 선택</h1>
            <div className={styles.genreGrid}>
                {GENRES.map((genreLabel) => {
                    const imageUrl = genreImages[genreLabel];
                    const cardStyle = imageUrl
                        ? { backgroundImage: `url(${imageUrl})` }
                        : {};

                    // URL 에서는 안전하게 인코딩 (경제/경영 때문에 중요)
                    const encodedGenre = encodeURIComponent(genreLabel);

                    return (
                        <Link
                            to={`/booklist/${encodedGenre}`}
                            key={genreLabel}
                            className={styles.genreCardLink}
                        >
                            <div className={styles.genreCard} style={cardStyle}>
                                <div className={styles.overlay}></div>
                                <div className={styles.cardContent}>
                                    <span className={styles.genreName}>
                                        {genreLabel}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default GenreList;

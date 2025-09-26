import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/Book/GenreList.module.css';

const genres = ['소설', '시-에세이', '경제/경영', '자기계발', '인문', '전체'];

function GenreList() {
    const [genreImages, setGenreImages] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8080/api/books')
            .then(response => {
                const books = response.data;
                const images = {};

                const genreRuleMap = {
                    '소설': (dbGenre) => dbGenre.includes('소설') || ['고전', '영미', '한국'].includes(dbGenre),
                    '시-에세이': (dbGenre) => dbGenre === '시/에세이',
                    '경제/경영': (dbGenre) => dbGenre.includes('경제') || dbGenre.includes('경영'),
                    '자기계발': (dbGenre) => dbGenre.includes('자기계발'),
                    '인문': (dbGenre) => dbGenre.includes('인문'),
                    '전체': (dbGenre) => true,
                };

                genres.forEach(displayGenre => {
                    const rule = genreRuleMap[displayGenre];
                    if (!rule) return;

                    const candidateImages = books
                        .filter(book => book.bookImage && typeof book.genre === 'string' && rule(book.genre))
                        .map(book => book.bookImage);

                    if (candidateImages.length > 0) {
                        const randomIndex = Math.floor(Math.random() * candidateImages.length);
                        images[displayGenre] = candidateImages[randomIndex];
                    }
                });

                setGenreImages(images);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching books for genre images:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>도서 장르 선택</h1>
            <div className={styles.genreGrid}>
                {genres.map(genre => {
                    const imageUrl = genreImages[genre];
                    const cardStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};

                    return (
                        <Link to={`/booklist/${genre}`} key={genre} className={styles.genreCardLink}>
                            <div className={styles.genreCard} style={cardStyle}>
                                <div className={styles.overlay}></div>
                                <div className={styles.cardContent}>
                                    <span className={styles.genreName}>{genre}</span>
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

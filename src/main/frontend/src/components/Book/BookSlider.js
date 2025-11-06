import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import styles from "../../assets/styles/BookSlider.module.css";

const BookSlider = ({ apiUrl }) => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(apiUrl)
            .then(({ data }) => {
                const items = Array.isArray(data) ? data : [];

                const mapped = items.map((item) => {
                    // 책 제목이 "제목 - 소제목" 또는 "제목: 소제목" 형식일 경우 앞부분만 사용
                    const mainTitle = item.bookName
                        ? item.bookName.split(/[-:()]/)[0].trim()
                        : "제목 정보 없음";

                    return {
                        id: item.id, // ✅ 상세 페이지 이동을 위해 id 포함
                        bookImage: item.bookImage || null,
                        bookName: mainTitle,
                    };
                });

                setBooks(mapped.slice(0, 10));
                console.log("받은 데이터:", mapped);
            })
            .catch((err) => {
                console.error("책 목록을 불러오지 못했습니다", err);
            });
    }, [apiUrl]);

    if (books.length === 0) {
        return (
            <div className={styles.sliderContainer}>
                <p style={{ textAlign: "center", padding: "2rem" }}>
                    불러올 책이 없습니다.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.sliderContainer}>
            <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={30}
                slidesPerView={5}
                slidesPerGroup={2}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={books.length > 1}
            >
                {books.map((book, idx) => (
                    <SwiperSlide
                        key={idx}
                        className={styles.slide}
                        onClick={() => navigate(`/books/${book.id}`)} // ✅ 상세 페이지 이동
                        style={{cursor: "pointer"}}
                    >
                        <div className={styles.coverBox}>
                            {book.bookImage ? (
                                <img
                                    src={book.bookImage}
                                    alt={book.bookName}
                                    className={styles.image}
                                />
                            ) : (
                                <div className={styles.noImage}>이미지 없음</div>
                            )}
                        </div>
                        <div className={styles.info}>
                            <h3>{book.bookName}</h3>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default BookSlider;
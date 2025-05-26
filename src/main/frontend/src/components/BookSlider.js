import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import styles from "../assets/styles/BookSlider.module.css";

const BookSlider = ({ apiUrl }) => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        axios.get(apiUrl)
            .then((res) => {
                // 책 목록을 10권까지만 자르기
                const slicedBooks = res.data.slice(0, 10);
                setBooks(slicedBooks);
            })
            .catch((err) => {
                console.error("책 목록을 불러오지 못했습니다", err);
            });
    }, [apiUrl]);

    return (
        <div className={styles.sliderContainer}>
            {books.length === 0 ? (
                <p style={{ textAlign: "center", padding: "2rem" }}>
                    불러올 책이 없습니다.
                </p>
            ) : (
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
                        <SwiperSlide key={idx} className={styles.slide}>
                            <img
                                src={book.bookImage}
                                alt={book.bookName}
                                className={styles.image}
                            />
                            <div className={styles.info}>
                                <h3>{book.bookName}</h3>
                                <p>{book.bookDescription}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
};

export default BookSlider;

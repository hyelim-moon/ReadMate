import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";

import "swiper/css";
import "swiper/css/pagination";
import styles from "../../assets/styles/BookSlider.module.css";

/**
 * 공용 책 슬라이더
 *  - apiUrl: 백엔드 BookDto[] 주소 (id, bookName, bookImage, genre 포함)
 *  - hideSubtitle: 제목 뒤 부제목 제거
 *  - category: 선택 카테고리(텍스트)
 */
const BookSlider = ({ apiUrl, hideSubtitle = true, category = "전체" }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [titleLimit, setTitleLimit] = useState(getLimitByWidth());
    const navigate = useNavigate();

    // 화면 폭에 따라 제목 길이 제한(문자 수) 조정
    useEffect(() => {
        const onResize = () => setTitleLimit(getLimitByWidth());
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // 데이터 로드
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError("");
        setBooks([]);

        axios
            .get(apiUrl)
            .then((res) => {
                if (!alive) return;
                const arr = Array.isArray(res.data) ? res.data : [];
                setBooks(arr);
            })
            .catch((e) => {
                if (!alive) return;
                setError(e?.response?.data?.message || e.message || "목록을 불러오지 못했습니다.");
            })
            .finally(() => alive && setLoading(false));

        return () => { alive = false; };
    }, [apiUrl]);

    // ----------- 카테고리 필터 -----------
    const filteredBooks = useMemo(() => {
        if (!category || category === "전체") return books;
        return books.filter((b) => matchByCategory(b?.genre, category));
    }, [books, category]);

    // 루프/레이아웃 안정화(아이템 적을 때 loop 끄기, 변경 시 재생성)
    const canLoop = filteredBooks.length >= 6; // 5개 보기 기준 여유분
    const swiperKey = `swiper-${category}-${filteredBooks.length}`;

    // ----------- 유틸 -----------
    const stripSubtitle = (title) => {
        if (!title) return "";
        let base = title;
        const seps = [" - ", " — ", " – ", ": ", " | ", "!", "+"];
        for (const sep of seps) {
            const i = base.indexOf(sep);
            if (i > -1) { base = base.slice(0, i); break; }
        }
        base = base.replace(/\s*\(.*?\)\s*$/g, "");
        return base.trim();
    };

    const truncate = (str, limit) => {
        if (!str) return "";
        const arr = Array.from(str);
        if (arr.length <= limit) return str;
        return arr.slice(0, Math.max(0, limit - 1)).join("") + "…";
    };

    // ----------- 렌더링 -----------
    if (loading) {
        return (
            <div className={styles.sliderContainer}>
                <div className={styles.loadingBox}>불러오는 중…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.sliderContainer}>
                <div className={styles.errorBox}>{error}</div>
            </div>
        );
    }

    if (!filteredBooks.length) {
        return (
            <div className={styles.sliderContainer}>
                <div className={styles.emptyBox}>해당 카테고리의 도서가 없습니다.</div>
            </div>
        );
    }

    return (
        <div className={styles.sliderContainer}>
            <Swiper
                key={swiperKey}                      // ✅ 카테고리 바뀔 때 인스턴스 재생성
                modules={[Autoplay, Pagination]}
                spaceBetween={30}
                slidesPerView={5}
                slidesPerGroup={4}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
                loop={canLoop}                        // ✅ 아이템 적으면 루프 끔
                rewind={!canLoop}                     // ✅ 루프 끌 때 처음/끝 자연스럽게 이동
                watchOverflow={true}                  // ✅ 슬라이드 부족 시 내비/스크롤 자동 비활성
                observer={true} observeParents={true} // ✅ 레이아웃 변경 감지
                updateOnWindowResize={true}
                resizeObserver={true}
                breakpoints={{
                    0:   { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 12 },
                    480: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
                    768: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 },
                    1024:{ slidesPerView: 5, slidesPerGroup: 4, spaceBetween: 30 },
                }}
            >
                {filteredBooks.map((book, idx) => {
                    const raw = hideSubtitle ? stripSubtitle(book.bookName) : (book.bookName || "");
                    const title = truncate(raw, titleLimit);

                    return (
                        <SwiperSlide
                            key={book.id ?? idx}
                            className={styles.slide}
                            onClick={() => navigate(`/books/${book.id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className={styles.coverBox}>
                                {book.bookImage ? (
                                    <img src={book.bookImage} alt={title} className={styles.image} loading="lazy" />
                                ) : (
                                    <div className={styles.noImage}>이미지 없음</div>
                                )}
                            </div>
                            <div className={styles.info}>
                                <h3 title={raw}>{title}</h3>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

/** 화면 폭에 따른 제목 길이 제한 */
function getLimitByWidth() {
    if (typeof window === "undefined") return 22;
    const w = window.innerWidth || 1024;
    if (w < 480) return 16;
    if (w < 768) return 18;
    if (w < 1024) return 20;
    return 24;
}

/** 장르 매칭 규칙 */
function matchByCategory(genre, category) {
    const g = (genre || "").replace(/\s/g, "");
    const c = (category || "").replace(/\s/g, "");
    if (!c || c === "전체") return true;

    if (c === "소설") {
        return g.includes("소설"); // 한국소설/영미소설/고전소설/소설 모두 포함
    }
    if (c === "시/에세이" || c === "시에세이") {
        return g.includes("에세이") || g === "시" || g.includes("시에세이");
    }
    if (c === "경제/경영" || c === "경제경영") {
        return g.includes("경제") || g.includes("경영");
    }
    if (c === "자기계발" || c === "자기개발") {
        return g.includes("자기계발") || g.includes("자기개발");
    }
    if (c === "인문") {
        return g.includes("인문");
    }
    // 그 외는 부분일치 허용
    return g.includes(c);
}

export default BookSlider;

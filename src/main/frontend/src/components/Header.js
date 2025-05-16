import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Header.module.css';
import logoImg from '../assets/images/logo.png';
import userImg from '../assets/images/userImg.png';
import { Link } from 'react-router-dom'

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('전체');

    const [rankingList, setRankingList] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideClass, setSlideClass] = useState(styles.slideInDown);

    const categories = ['전체', '제목', '저자', '장르', '출판사'];

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleSelect = (category) => {
        setSelectedCategory(category);
        setDropdownOpen(false);
    };

    const getRankDisplay = (rank) => {
        switch (rank) {
            case 1:
                return '🥇 현재 랭킹 1위';
            case 2:
                return '🥈 현재 랭킹 2위';
            case 3:
                return '🥉 현재 랭킹 3위';
            default:
                return `🏆 현재 랭킹 ${rank}위`;
        }
    };

    useEffect(() => {
        fetch('http://localhost:8080/api/users/ranking')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('✅ 랭킹 API 응답:', data);
                setRankingList(data);
                setRankingLoading(false);
            })
            .catch(err => {
                console.error('❌ Failed to fetch ranking list:', err);
                setRankingLoading(false);
            });
    }, []);

    useEffect(() => {
        if (rankingList.length === 0) return;

        const interval = setInterval(() => {
            setSlideClass('');
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % rankingList.length);
                setSlideClass(styles.slideInDown);
            }, 50);
        }, 5000);

        return () => clearInterval(interval);
    }, [rankingList]);

    return (
        <header className={styles.header}>
            {/* 슬라이드 랭킹 영역 */}
            <div className={styles.userRanking}>
                {rankingLoading ? (
                    <p>불러오는 중...</p>
                ) : (
                    rankingList.length > 0 && (
                        <div className={`${slideClass} ${styles.rankDisplay}`}>
                            {getRankDisplay(rankingList[currentIndex].rank)} - {rankingList[currentIndex].nickname} ({rankingList[currentIndex].points}점)
                        </div>
                    )
                )}
            </div>

            <div className={styles.box}></div>

            <div className={styles.mainHeaderContent}>
                <div className={styles.logo}>
                    <Link to={"/"}>
                        <img src={logoImg} alt="ReadMate Logo" />
                    </Link>
                </div>

                {/* 검색바 영역 */}
                <div className={styles.search}>
                    <div className={styles.dropdown} onClick={toggleDropdown}>
                        <span>{selectedCategory}</span>
                        <span className={styles.arrow}>{dropdownOpen ? '▲' : '▼'}</span>
                        {dropdownOpen && (
                            <ul className={styles.dropdownMenu}>
                                {categories.map((cat) => (
                                    <li key={cat} onClick={() => handleSelect(cat)}>
                                        {cat}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <input type="text" placeholder="검색어를 입력하세요" />
                    <button className={styles.searchBtn}>🔍︎ 검색</button>
                </div>

                <div className={styles.userInfo}>
                    <img src={userImg} alt="userImg" />
                </div>
            </div>
        </header>
    );
}

export default Header;

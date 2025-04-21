import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Header.module.css';
import logoImg from '../assets/images/logo.png';
import userImg from '../assets/images/userImg.png';
import {Link, link} from 'react-router-dom';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [rankingList, setRankingList] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);

    const categories = [
        '전체',
        '제목',
        '저자',
        '장르',
        '출판사'
    ];

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleSelect = (category) => {
        setSelectedCategory(category);
        setDropdownOpen(false);
    };

    useEffect(() => {
        // 전체 랭킹 (TOP 10)
        fetch('http://localhost:8080/api/users/ranking')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
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

    return (
        <header className={styles.header}>
            <div className={styles.userRanking}>
                <h4>🏅 TOP 10 유저</h4>
                {rankingLoading ? (
                    <p>불러오는 중...</p>
                ) : (
                    <ul>
                        {rankingList.slice(0, 10).map((user, index) => (
                            <li
                                key={user.rank}
                                className={styles.fadeIn}
                                style={{ animationDelay: `${index * 0.9}s` }}
                            >
                                {user.rank}위 - {user.nickName}
                            </li>
                        ))}
                    </ul>
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

import React, { useState } from 'react';
import styles from '../assets/styles/Header.module.css';
import logoImg from '../assets/images/logo.png';
import userImg from '../assets/images/userImg.png';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = [
        'Books',
        'Fiction',
        'Kids Books',
        'Non Fiction',
        'Uncategorized',
        'Young Adult',
    ];

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleSelect = (category) => {
        setSelectedCategory(category);
        setDropdownOpen(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.userRanking}>
                1위 (닉네임)님
            </div>
            <div className={styles.box}></div>
            <div className={styles.mainHeaderContent}>
                <div className={styles.logo}>
                    <img src={logoImg} alt="ReadMate Logo" />
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
                    <input type="text" placeholder="Search products..." />
                    <button className={styles.searchBtn}>🔍︎ Search</button>
                </div>

                <div className={styles.userInfo}>
                    <img src={userImg} alt="userImg" />
                </div>
            </div>
        </header>
    );
}

export default Header;

import React, { useState, useEffect } from 'react';
import styles from '../../assets/styles/Header.module.css';
import logoImg from '../../assets/images/logo.png';
import userImg from '../../assets/images/userImg.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaTrophy, FaShoppingCart, FaComments, FaQuestionCircle, FaSearch } from 'react-icons/fa';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [rankingList, setRankingList] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideClass, setSlideClass] = useState(styles.slideInDown);

    // **추가: 로그인 상태 관리**
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const categories = ['전체', '제목', '저자', '장르', '출판사'];

    // 검색 페이지가 아니게 될 때만 검색어 초기화
    useEffect(() => {
        if (!location.pathname.startsWith('/search')) {
            setKeyword('');
            setDropdownOpen(false);
        }
    }, [location.pathname]);

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
        // **추가: 로컬스토리지에 ACCESS_TOKEN이 있으면 로그인된 상태로 설정**
        const token = localStorage.getItem('ACCESS_TOKEN');
        setIsLoggedIn(!!token);

        // 랭킹 데이터 로드
        fetch('http://localhost:8080/api/users/ranking')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
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

    const handleSearch = () => {
        if(keyword.trim() === '') return;
        navigate(`/search?category=${selectedCategory}&keyword=${encodeURIComponent(keyword.trim())}`);
    };

    const onKeyPress = (e) => {
        if(e.key === 'Enter') {
            handleSearch();
        }
    }

    return (
        <header className={styles.header}>
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
                    <Link to="/">
                        <img src={logoImg} alt="ReadMate Logo" />
                    </Link>
                </div>

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
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyPress={onKeyPress}
                    />
                    <button className={styles.searchBtn} onClick={handleSearch}>
                        <FaSearch />
                    </button>
                </div>

                <div>
                    <nav className={styles.navbar}>
                        <Link to="/booklist"><button><FaBook /> 도서 목록</button></Link>
                        <Link to="/challenge"><button><FaTrophy /> 챌린지</button></Link>
                        <Link to="/pointShop"><button><FaShoppingCart /> 포인트샵</button></Link>
                        <Link to="/community"><button><FaComments /> 커뮤니티</button></Link>
                        <Link to="/help"><button><FaQuestionCircle /> 도움말</button></Link>
                    </nav>
                </div>

                <div className={styles.userInfo}>
                    {/* 로그인 상태에 따라 /login 또는 /mypage로 이동 */}
                    <Link to={isLoggedIn ? '/mypage' : '/login'}>
                        <img src={userImg} alt="userImg" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
export default Header;
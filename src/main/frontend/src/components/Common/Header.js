import React, {useState, useEffect, useRef} from 'react';
import styles from '../../assets/styles/Header.module.css';
import logoImg from '../../assets/images/logo.png';
import userImg from '../../assets/images/userImg.png';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {
    FaBook,
    FaTrophy,
    FaShoppingCart,
    FaComments,
    FaQuestionCircle,
    FaSearch,
    FaChevronDown,
    FaUser
} from 'react-icons/fa';

function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false); // 검색 카테고리 드롭다운
    const [bookDropdownOpen, setBookDropdownOpen] = useState(false); // 도서 관련 드롭다운
    const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false); // 챌린지 드롭다운 추가
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const [rankingList, setRankingList] = useState([]);
    const [rankingLoading, setRankingLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideClass, setSlideClass] = useState(styles.slideInDown);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const categories = ['전체', '제목', '저자', '장르', '출판사'];

    // 드롭다운 참조를 위한 useRef
    const bookDropdownRef = useRef(null);
    const searchDropdownRef = useRef(null);
    const challengeDropdownRef = useRef(null); // 챌린지 드롭다운 참조 추가

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        setIsLoggedIn(!!token);

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

    // 외부 클릭 감지하여 드롭다운 닫기
    useEffect(() => {
        function handleClickOutside(event) {
            if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target)) {
                setBookDropdownOpen(false);
            }
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (challengeDropdownRef.current && !challengeDropdownRef.current.contains(event.target)) { // 챌린지 드롭다운 참조 추가
                setChallengeDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 페이지 이동 시 드롭다운 닫기
    useEffect(() => {
        setBookDropdownOpen(false);
        setDropdownOpen(false);
        setChallengeDropdownOpen(false); // 챌린지 드롭다운 닫기 추가
    }, [location.pathname]);


    const toggleSearchDropdown = () => setDropdownOpen(!dropdownOpen);
    const handleSelect = (category) => {
        setSelectedCategory(category);
        setDropdownOpen(false);
    };

    // 도서 드롭다운 메뉴 항목 클릭 시
    const handleBookMenuItemClick = (path) => {
        navigate(path);
        setBookDropdownOpen(false); // 드롭다운 닫기
    };

    // 챌린지 드롭다운 메뉴 항목 클릭 시
    const handleChallengeMenuItemClick = (path) => { // 챌린지 메뉴 클릭 핸들러 추가
        navigate(path);
        setChallengeDropdownOpen(false); // 드롭다운 닫기
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

    const handleSearch = () => {
        if (keyword.trim() === '') return;
        navigate(`/search?category=${selectedCategory}&keyword=${encodeURIComponent(keyword.trim())}`);
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
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
                        <img src={logoImg} alt="ReadMate Logo"/>
                    </Link>
                </div>

                <div className={styles.search}>
                    <div className={styles.dropdown} onClick={toggleSearchDropdown} ref={searchDropdownRef}>
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
                        <FaSearch/>
                    </button>
                </div>

                <div>
                    <nav className={styles.navbar}>
                        {/* 도서 관련 메뉴를 드롭다운으로 묶음 (클릭 시 열림/닫힘) */}
                        <div
                            className={styles.dropdown}
                            ref={bookDropdownRef}
                        >
                            <button onClick={() => setBookDropdownOpen(!bookDropdownOpen)}> {/* 버튼 클릭 시 드롭다운 토글 */}
                                <FaBook/> 도서 <FaChevronDown
                                    className={`${styles.dropdownArrow} ${bookDropdownOpen ? styles.arrowUp : ''}`}/>
                            </button>
                            {bookDropdownOpen && (
                                <ul className={styles.dropdownMenu}>
                                    <li onClick={() => handleBookMenuItemClick('/recordlist')}>독서기록</li>
                                    <li onClick={() => handleBookMenuItemClick('/mylibrary')}>내 서재</li>
                                    <li onClick={() => handleBookMenuItemClick('/booklist')}>도서 목록</li>
                                </ul>
                            )}
                        </div>
                        {/* 챌린지 관련 메뉴를 드롭다운으로 묶음 */}
                        <div
                            className={styles.dropdown}
                            ref={challengeDropdownRef}
                        >
                            <button onClick={() => setChallengeDropdownOpen(!challengeDropdownOpen)}>
                                <FaTrophy/> 챌린지 <FaChevronDown
                                className={`${styles.dropdownArrow} ${challengeDropdownOpen ? styles.arrowUp : ''}`}/>
                            </button>
                            {challengeDropdownOpen && (
                                <ul className={styles.dropdownMenu}>
                                    <li onClick={() => handleChallengeMenuItemClick('/challenge')}>도전과제</li>
                                    <li onClick={() => handleChallengeMenuItemClick('/team-challenge')}>팀 경쟁</li>
                                </ul>
                            )}
                        </div>
                        <Link to="/pointShop">
                            <button><FaShoppingCart/> 포인트샵</button>
                        </Link>
                        <Link to="/community">
                            <button><FaComments/> 커뮤니티</button>
                        </Link>
                        <Link to="/help">
                            <button><FaQuestionCircle/> 도움말</button>
                        </Link>
                    </nav>
                </div>

                {/* userInfo를 다시 이미지 링크로 변경 */}
                <div className={styles.userInfo}>
                    <Link to={isLoggedIn ? '/mypage' : '/login'}>
                        <img src={userImg} alt="userImg"/>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/MyPage.module.css';
import logoImg from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';

function MyPage() {
    const [profile, setProfile] = useState({
        nickname: '',
        coupons: 0,
        mileage: 0,
        wishlist: [], // ✅ 찜한 도서
        records: []    // ✅ 독서 기록
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        const headers = { Authorization: `Bearer ${token}` };

        // 사용자 기본 정보
        axios
            .get('http://localhost:8080/api/users/me', { headers })
            .then(({ data }) => {
                setProfile(prev => ({
                    ...prev,
                    nickname: data.nickname,
                    coupons: data.coupons,
                    mileage: data.mileage
                }));
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('ACCESS_TOKEN');
                    window.location.href = '/login';
                }
            });

        // 독서 기록
        axios
            .get('http://localhost:8080/api/records', { headers })
            .then(({ data }) => {
                setProfile(prev => ({
                    ...prev,
                    records: data || []
                }));
            })
            .catch(err => {
                console.error('독서 기록 불러오기 실패:', err);
            });

        // 찜한 도서
        axios
            .get('http://localhost:8080/api/wishlist', { headers })
            .then(({ data }) => {
                setProfile(prev => ({
                    ...prev,
                    wishlist: data || []
                }));
            })
            .catch(err => {
                console.error('찜한 도서 불러오기 실패:', err);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        window.location.href = '/login';
    };

    return (
        <div className={styles.container}>
            <header className={styles.topBar}>
                <Link to="/" className={styles.logoLink}>
                    <img src={logoImg} alt="ReadMate Logo" className={styles.logoImg} />
                </Link>
                <div className={styles.rightControls}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="메뉴 토글"
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
                {menuOpen && (
                    <ul className={styles.menuList}>
                        <li><Link to="/profile-edit">내 정보</Link></li>
                        <li><Link to="/mylibrary">내 서재</Link></li>
                        <li><Link to="/challenge">챌린지</Link></li>
                        <li><Link to="/recordlist">독서기록</Link></li>
                        <li><Link to="/myreview">도서리뷰</Link></li>
                        <li><Link to="/storage">보관함</Link></li>
                        <li><Link to="/purchase-history">구매내역</Link></li>
                        <li><Link to="/contactlist">문의하기</Link></li>
                    </ul>
                )}
            </header>

            <div className={styles.content}>
                <div className={styles.greeting}>
                    <p><strong>{profile.nickname}</strong>님, 안녕하세요!</p>
                    <button
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                        title="로그아웃"
                    >
                        <FiLogOut className={styles.logoutIcon} />
                    </button>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statBox}>
                        <p>{profile.coupons}장</p>
                        <span>쿠폰</span>
                    </div>
                    <Link to="/point-history" className={styles.statBox}>
                        <p>{profile.mileage}P</p>
                        <span>포인트</span>
                    </Link>
                </div>

                {/* 독서 기록 */}
                <section className={styles.section}>
                    <h3>독서 기록</h3>
                    {profile.records.length === 0 ? (
                        <div className={styles.emptyBox}>독서 기록이 없습니다.</div>
                    ) : (
                        <ul className={styles.bookList}>
                            {profile.records.map(item => (
                                <li
                                    key={item.id}
                                    className={styles.bookItem}
                                    onClick={() => navigate(`/record/${item.id}`)}
                                >
                                    {item.photo && (
                                        <img
                                            src={`http://localhost:8080${item.photo}`}
                                            alt={item.title}
                                            className={styles.bookImage}
                                        />
                                    )}
                                    <p className={styles.bookTitle}>{item.title}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* 찜한 도서 */}
                <section className={styles.section}>
                    <h3>찜한 도서</h3>
                    {profile.wishlist.length === 0 ? (
                        <div className={styles.emptyBox}>찜한 도서가 없습니다.</div>
                    ) : (
                        <ul className={styles.bookList}>
                            {profile.wishlist.map(book => (
                                <li
                                    key={book.id}
                                    className={styles.bookItem}
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    {book.bookImage && (
                                        <img
                                            src={book.bookImage}
                                            alt={book.bookName}
                                            className={styles.bookImage}
                                        />
                                    )}
                                    <p className={styles.bookTitle}>{book.bookName}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

export default MyPage;

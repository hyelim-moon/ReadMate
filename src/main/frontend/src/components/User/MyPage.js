import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/MyPage.module.css';
import logoImg from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX, FiUser, FiBook, FiAward, FiEdit, FiMessageSquare, FiArchive, FiShoppingBag, FiHelpCircle, FiUsers } from 'react-icons/fi';

// 가상 친구 데이터 (이미지 URL 제거)
const friends = [
    { id: 1, nickname: '책벌레' },
    { id: 2, nickname: '독서왕' },
    { id: 3, nickname: '리드메이트' },
    { id: 4, nickname: '글쓴이' },
];

function MyPage() {
    const [profile, setProfile] = useState({
        nickname: '',
        coupons: 0,
        mileage: 0,
        wishlist: [],
        records: []
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        const headers = { Authorization: `Bearer ${token}` };

        axios.get('http://localhost:8080/api/users/me', { headers })
            .then(({ data }) => {
                setProfile(prev => ({ ...prev, nickname: data.nickname, coupons: data.coupons, mileage: data.mileage }));
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('ACCESS_TOKEN');
                    window.location.href = '/login';
                }
            });

        axios.get('http://localhost:8080/api/records/latest?limit=8', { headers })
            .then(({ data }) => {
                setProfile(prev => ({ ...prev, records: data || [] }));
            })
            .catch(err => console.error('최신 독서 기록 불러오기 실패:', err));

        axios.get('http://localhost:8080/api/wishlist', { headers })
            .then(({ data }) => {
                setProfile(prev => ({ ...prev, wishlist: data || [] }));
            })
            .catch(err => console.error('찜한 도서 불러오기 실패:', err));
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
                    <button className={styles.menuButton} onClick={() => setMenuOpen(o => !o)} aria-label="메뉴 토글">
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
                {menuOpen && (
                    <ul className={styles.menuList}>
                        <li><Link to="/profile-edit"><FiUser /><span>내 정보</span></Link></li>
                        <li><Link to="/mylibrary"><FiBook /><span>내 서재</span></Link></li>
                        <li><Link to="/friends"><FiUsers /><span>친구</span></Link></li>
                        <li><Link to="/challenge"><FiAward /><span>챌린지</span></Link></li>
                        <li><Link to="/recordlist"><FiEdit /><span>독서기록</span></Link></li>
                        <li><Link to="/myreviews"><FiMessageSquare /><span>내 리뷰</span></Link></li>
                        <li><Link to="/storage"><FiArchive /><span>보관함</span></Link></li>
                        <li><Link to="/purchase-history"><FiShoppingBag /><span>구매내역</span></Link></li>
                        <li><Link to="/contactlist"><FiHelpCircle /><span>문의하기</span></Link></li>
                    </ul>
                )}
            </header>

            <div className={styles.content}>
                <div className={styles.greeting}>
                    <p><strong>{profile.nickname}</strong>님, 안녕하세요!</p>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="로그아웃">
                        <FiLogOut className={styles.logoutIcon} />
                    </button>
                </div>

                <div className={styles.stats}>
                    <Link to="/storage" className={styles.statBox}>
                        <p>{profile.coupons}장</p>
                        <span>쿠폰</span>
                    </Link>
                    <Link to="/point-history" className={styles.statBox}>
                        <p>{profile.mileage}P</p>
                        <span>포인트</span>
                    </Link>
                </div>

                <>
                    <section className={styles.section}>
                        <h3>독서 기록</h3>
                        {profile.records.length === 0 ? (
                            <div className={styles.emptyBox}>독서 기록이 없습니다.</div>
                        ) : (
                            <ul className={styles.bookList}>
                                {profile.records.map(item => (
                                    <li key={item.id} className={styles.bookItem} onClick={() => navigate(`/record/${item.id}`)}>
                                        {item.photo && <img src={`http://localhost:8080${item.photo}`} alt={item.title} className={styles.bookImage} />}
                                        <p className={styles.bookTitle}>{item.title}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h3>찜한 도서</h3>
                        {profile.wishlist.length === 0 ? (
                            <div className={styles.emptyBox}>찜한 도서가 없습니다.</div>
                        ) : (
                            <ul className={styles.bookList}>
                                {profile.wishlist.map(book => (
                                    <li key={book.id} className={styles.bookItem} onClick={() => navigate(`/books/${book.id}`)}>
                                        {book.bookImage && <img src={book.bookImage} alt={book.bookName} className={styles.bookImage} />}
                                        <p className={styles.bookTitle}>{book.bookName}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* 친구 섹션 */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3><FiUsers /> 친구</h3>
                            <Link to="/friends" className={styles.seeMore}>더보기</Link>
                        </div>
                        {friends.length === 0 ? (
                            <div className={styles.emptyBox}>친구가 없습니다.</div>
                        ) : (
                            <ul className={styles.friendList}>
                                {friends.map(friend => (
                                    <li key={friend.id} className={styles.friendItem}>
                                        <div className={styles.friendImage} />
                                        <p className={styles.friendNickname}>{friend.nickname}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            </div>
        </div>
    );
}

export default MyPage;
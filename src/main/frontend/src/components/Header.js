import styles from '../assets/styles/Header.module.css';
import logoImg from '../assets/images/logo.png';

function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.userInfo}>
                <a href="/login">로그인</a>
            </div>
            <div className={styles.mainHeaderContent}>
                <div className={styles.logo}>
                    <img src={logoImg} alt="ReadMate Logo"/>
                </div>
                <div className={styles.search}>
                    <button>검색조건</button>
                    <input type="text" placeholder="검색창"/>
                    <button>🔍︎</button>
                </div>
                <div className={styles.userRanking}>
                    1위 (닉네임)님
                </div>
            </div>
        </header>
    );
}

export default Header;
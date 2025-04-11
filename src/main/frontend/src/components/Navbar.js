import styles from '../assets/styles/Navbar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <button>독서 기록</button>
            <button>독서 경쟁</button>
            <button>포인트샵</button>
            <button>커뮤니티</button>
        </nav>
    );
}

export default Navbar;
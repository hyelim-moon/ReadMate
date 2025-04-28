import { Link } from 'react-router-dom';
import styles from '../assets/styles/Navbar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link to="/record"><button>독서 기록</button></Link>
            <Link to="/competition"><button>독서 경쟁</button></Link>
            <Link to="/pointShop"><button>포인트샵</button></Link>
            <Link to="/community"><button>커뮤니티</button></Link>
        </nav>
    );
}

export default Navbar;

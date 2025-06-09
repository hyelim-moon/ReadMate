import React from "react";
import styles from "../assets/styles/Forgot.module.css";
import logoImg from "../assets/images/logo.png"; // 로고 이미지 경로
import { Link } from "react-router-dom";

function Forgot() {
    return (
        <div className={styles.container}>
            {/* ① 상단 로고 */}
            <Link to="/">
                <img src={logoImg} alt="ReadMate Logo" className={styles.logoImg} />
            </Link>

            {/* ② 흰색 카드 박스 (비밀번호 찾기 폼) */}
            <div className={styles.box}>
                {/* 제목 */}
                <h2 className={styles.title}>비밀번호 찾기</h2>

                {/* 폼: 아이디 / 이름 / 이메일 입력 */}
                <form className={styles.form}>
                    <input
                        type="text"
                        placeholder="아이디"
                        className={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="이름"
                        className={styles.input}
                    />
                    <input
                        type="email"
                        placeholder="이메일"
                        className={styles.input}
                    />

                    {/* 비밀번호 찾기 버튼 */}
                    <button type="submit" className={styles.button}>
                        비밀번호 찾기
                    </button>
                </form>

                {/* ③ 하단 링크 (로그인으로 돌아가기) */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.link}>
                        로그인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Forgot;

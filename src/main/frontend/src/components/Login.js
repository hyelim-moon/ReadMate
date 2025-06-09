// src/components/Login.jsx (수정 포인트만 표시)
import React, { useState } from 'react';
import styles from "../assets/styles/Login.module.css";
import logoImg from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const navigate = useNavigate();
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", {
                userId: userid,        // email → userid로 변경
                password
            });
            const { token } = response.data;
            localStorage.setItem("ACCESS_TOKEN", token);
            navigate("/");
        } catch (err) {
            if (err.response && err.response.data) {
                setErrorMsg(err.response.data.toString());
            } else {
                setErrorMsg("로그인 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <Link to={"/"}>
                <img src={logoImg} alt="ReadMate Logo" className={styles.logoImg} />
            </Link>

            <div className={styles.loginBox}>
                <h2 className={styles.title}>로그인</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="아이디"
                        className={styles.input}
                        value={userid}
                        onChange={(e) => setUserid(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {errorMsg && <p style={{ color: "red", marginBottom: "8px" }}>{errorMsg}</p>}

                    <div className={styles.options}>
                        <label className={styles.checkbox}>
                            <input type="checkbox" /> 자동 로그인
                        </label>
                        <Link to="/forgot" className={styles.link}>비밀번호 찾기</Link>
                    </div>

                    <button type="submit" className={styles.button}>
                        로그인
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>계정이 없으신가요?</span>
                    <Link to="/signup" className={styles.link}>회원가입</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;

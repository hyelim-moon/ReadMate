// src/components/SignUp.jsx
import React, { useState } from "react";
import axios from "axios";
import styles from "../assets/styles/SignUp.module.css";
import logoImg from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignUp() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        nickname: "",
        name: "",
        email: "",
        phone1: "",
        phone2: "",
        phone3: "",
        birthDate: "",
        agree: false,
    });
    const [errors, setErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        if (["phone1", "phone2", "phone3"].includes(name)) {
            setErrors((prev) => ({ ...prev, phone: "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        // 기본 필수 입력 검사
        Object.entries(form).forEach(([key, val]) => {
            if (["phone1", "phone2", "phone3", "agree"].includes(key)) return;
            if (typeof val === "string" ? !val.trim() : !val) {
                newErrors[key] = "필수 입력입니다.";
            }
        });
        // 전화번호 검사
        if (!form.phone1.trim() || !form.phone2.trim() || !form.phone3.trim()) {
            newErrors.phone = "필수 입력입니다.";
        }
        // 약관 동의 검사
        if (!form.agree) {
            newErrors.agree = "약관에 동의해주세요.";
        }
        // 비밀번호 일치 검사
        if (
            form.password &&
            form.passwordConfirm &&
            form.password !== form.passwordConfirm
        ) {
            newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            const firstKey = Object.keys(newErrors)[0];
            if (firstKey === "phone") {
                document.getElementsByName("phone1")[0]?.focus();
            } else {
                document.getElementsByName(firstKey)[0]?.focus();
            }
            return;
        }

        // 백엔드 DTO에 맞춘 payload 생성
        const payload = {
            userid: form.username,
            password: form.password,
            nickname: form.nickname,
            name: form.name,
            email: form.email,
            phone: `${form.phone1}-${form.phone2}-${form.phone3}`,
            gender: "",               // 필요 시 성별 입력 필드를 추가 후 form.gender 로 바꿔주세요
            birthdate: form.birthDate,
        };

        // 회원가입 요청
        axios
            .post("http://localhost:8080/api/auth/register", payload)
            .then(() => {
                navigate("/login");
            })
            .catch((err) => {
                console.error(err);
                alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
            });
    };

    return (
        <div className={styles.container}>
            <Link to="/">
                <img src={logoImg} alt="ReadMate Logo" className={styles.logoImg} />
            </Link>

            <div className={styles.signupBox}>
                <h2 className={styles.title}>회원가입</h2>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* 1) 아이디 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.inputLabel}>
                            아이디
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className={`${styles.input} ${
                                errors.username ? styles.inputError : ""
                            }`}
                            value={form.username}
                            onChange={handleChange}
                        />
                        {errors.username && (
                            <div className={styles.errorText}>{errors.username}</div>
                        )}
                    </div>

                    {/* 2) 비밀번호 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.inputLabel}>
                            비밀번호
                        </label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className={`${styles.input} ${
                                    errors.password ? styles.inputError : ""
                                }`}
                                value={form.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                        {errors.password && (
                            <div className={styles.errorText}>{errors.password}</div>
                        )}
                    </div>

                    {/* 3) 비밀번호 확인 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="passwordConfirm" className={styles.inputLabel}>
                            비밀번호 확인
                        </label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type={showPasswordConfirm ? "text" : "password"}
                                className={`${styles.input} ${
                                    errors.passwordConfirm ? styles.inputError : ""
                                }`}
                                value={form.passwordConfirm}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className={styles.toggleBtn}
                                onClick={() => setShowPasswordConfirm((v) => !v)}
                            >
                                {showPasswordConfirm ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                        {errors.passwordConfirm && (
                            <div className={styles.errorText}>
                                {errors.passwordConfirm}
                            </div>
                        )}
                    </div>

                    {/* 4) 닉네임 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="nickname" className={styles.inputLabel}>
                            닉네임
                        </label>
                        <input
                            id="nickname"
                            name="nickname"
                            type="text"
                            className={`${styles.input} ${
                                errors.nickname ? styles.inputError : ""
                            }`}
                            value={form.nickname}
                            onChange={handleChange}
                        />
                        {errors.nickname && (
                            <div className={styles.errorText}>{errors.nickname}</div>
                        )}
                    </div>

                    {/* 5) 이름 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.inputLabel}>
                            이름
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <div className={styles.errorText}>{errors.name}</div>
                        )}
                    </div>

                    {/* 6) 이메일 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.inputLabel}>
                            이메일
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={`${styles.input} ${
                                errors.email ? styles.inputError : ""
                            }`}
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <div className={styles.errorText}>{errors.email}</div>
                        )}
                    </div>

                    {/* 7) 전화번호 그룹 */}
                    <div className={styles.formGroup}>
                        <label className={styles.inputLabel}>전화번호</label>
                        <div className={styles.phoneRow}>
                            {["phone1", "phone2", "phone3"].map((key, idx) => (
                                <React.Fragment key={key}>
                                    <input
                                        name={key}
                                        type="text"
                                        placeholder={
                                            idx === 0 ? "010" : idx === 1 ? "1234" : "5678"
                                        }
                                        className={`
                      ${styles.phoneInput}
                      ${errors.phone ? styles.inputError : ""}
                      ${idx === 0 ? styles.firstPhoneInput : ""}
                    `}
                                        value={form[key]}
                                        onChange={handleChange}
                                    />
                                    {idx < 2 && <span className={styles.dash}>-</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        {errors.phone && (
                            <div className={styles.errorText}>{errors.phone}</div>
                        )}
                    </div>

                    {/* 8) 생년월일 */}
                    <div className={styles.formGroup}>
                        <label htmlFor="birthDate" className={styles.inputLabel}>
                            생년월일
                        </label>
                        <input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            className={`${styles.input} ${
                                errors.birthDate ? styles.inputError : ""
                            }`}
                            value={form.birthDate}
                            onChange={handleChange}
                        />
                        {errors.birthDate && (
                            <div className={styles.errorText}>{errors.birthDate}</div>
                        )}
                    </div>

                    {/* 9) 약관 동의 */}
                    <div className={styles.formGroup}>
                        <label className={styles.checkbox}>
                            <input
                                name="agree"
                                type="checkbox"
                                checked={form.agree}
                                onChange={handleChange}
                            />
                            이용약관 및 개인정보 수집에 동의합니다
                        </label>
                        {errors.agree && (
                            <div className={styles.errorText}>{errors.agree}</div>
                        )}
                    </div>

                    {/* 10) 가입 버튼 */}
                    <button type="submit" className={styles.button}>
                        회원가입
                    </button>
                </form>

                <div className={styles.footer}>
                    이미 계정이 있으신가요?
                    <Link to="/login" className={styles.link}>
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SignUp;

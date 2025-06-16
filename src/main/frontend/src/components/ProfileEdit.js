import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../assets/styles/ProfileEdit.module.css";

function ProfileEdit() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        nickname: "",
        name: "",
        email: "",
        phone1: "",
        phone2: "",
        phone3: "",
        birthDate: "",
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios
            .get("/users/me")
            .then((response) => {
                const { phone, ...userData } = response.data;
                const [phone1 = "", phone2 = "", phone3 = ""] = phone?.split("-") || [];

                setForm({
                    ...userData,
                    phone1,
                    phone2,
                    phone3,
                    currentPassword: "",
                    newPassword: "",
                    newPasswordConfirm: "",
                });
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("사용자 정보 불러오기 실패:", error);
                alert("로그인 세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                navigate("/login");
            });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // 필수 입력 검사 (currentPassword, newPassword, newPasswordConfirm 제외)
        Object.entries(form).forEach(([key, val]) => {
            if (
                !["currentPassword", "newPassword", "newPasswordConfirm"].includes(key) &&
                !val.trim()
            ) {
                newErrors[key] = "필수 입력입니다.";
            }
        });

        // 비밀번호 변경 시 유효성 검사
        if (form.newPassword || form.newPasswordConfirm) {
            if (!form.currentPassword) {
                newErrors.currentPassword = "현재 비밀번호를 입력하세요.";
            }
            if (form.newPassword !== form.newPasswordConfirm) {
                newErrors.newPasswordConfirm = "새 비밀번호가 일치하지 않습니다.";
            }
        }

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            ...form,
            phone: `${form.phone1}-${form.phone2}-${form.phone3}`,
            passwordUpdate: form.newPassword
                ? {
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }
                : null,
        };

        axios
            .put("/users/me", payload)
            .then(() => {
                alert("회원정보가 성공적으로 수정되었습니다.");
                navigate("/profile");
            })
            .catch((error) => {
                console.error("회원정보 수정 실패:", error);
                alert("회원정보 수정에 실패했습니다.");
            });
    };

    if (isLoading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>회원정보 수정</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                {/* 아이디 */}
                <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.inputLabel}>
                        아이디
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
                        value={form.username}
                        onChange={handleChange}
                        disabled
                    />
                    {errors.username && <div className={styles.errorText}>{errors.username}</div>}
                </div>

                {/* 닉네임 */}
                <div className={styles.formGroup}>
                    <label htmlFor="nickname" className={styles.inputLabel}>
                        닉네임
                    </label>
                    <input
                        id="nickname"
                        name="nickname"
                        type="text"
                        className={`${styles.input} ${errors.nickname ? styles.inputError : ""}`}
                        value={form.nickname}
                        onChange={handleChange}
                    />
                    {errors.nickname && <div className={styles.errorText}>{errors.nickname}</div>}
                </div>

                {/* 이름 */}
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
                    {errors.name && <div className={styles.errorText}>{errors.name}</div>}
                </div>

                {/* 이메일 */}
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.inputLabel}>
                        이메일
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                        value={form.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                </div>

                {/* 전화번호 */}
                <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>전화번호</label>
                    <div className={styles.phoneRow}>
                        {["phone1", "phone2", "phone3"].map((key, idx) => (
                            <React.Fragment key={key}>
                                <input
                                    name={key}
                                    type="text"
                                    placeholder={idx === 0 ? "010" : idx === 1 ? "1234" : "5678"}
                                    className={`${styles.phoneInput} ${errors.phone ? styles.inputError : ""}`}
                                    value={form[key]}
                                    onChange={handleChange}
                                />
                                {idx < 2 && <span className={styles.dash}>-</span>}
                            </React.Fragment>
                        ))}
                    </div>
                    {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
                </div>

                {/* 생년월일 */}
                <div className={styles.formGroup}>
                    <label htmlFor="birthDate" className={styles.inputLabel}>
                        생년월일
                    </label>
                    <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        className={`${styles.input} ${errors.birthDate ? styles.inputError : ""}`}
                        value={form.birthDate}
                        onChange={handleChange}
                    />
                    {errors.birthDate && <div className={styles.errorText}>{errors.birthDate}</div>}
                </div>

                {/* 현재 비밀번호 */}
                <div className={styles.formGroup}>
                    <label htmlFor="currentPassword" className={styles.inputLabel}>
                        현재 비밀번호
                    </label>
                    <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className={`${styles.input} ${errors.currentPassword ? styles.inputError : ""}`}
                        value={form.currentPassword}
                        onChange={handleChange}
                    />
                    {errors.currentPassword && (
                        <div className={styles.errorText}>{errors.currentPassword}</div>
                    )}
                </div>

                {/* 새 비밀번호 */}
                <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.inputLabel}>
                        새 비밀번호
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
                        value={form.newPassword}
                        onChange={handleChange}
                    />
                    {errors.newPassword && <div className={styles.errorText}>{errors.newPassword}</div>}
                </div>

                {/* 새 비밀번호 확인 */}
                <div className={styles.formGroup}>
                    <label htmlFor="newPasswordConfirm" className={styles.inputLabel}>
                        새 비밀번호 확인
                    </label>
                    <input
                        id="newPasswordConfirm"
                        name="newPasswordConfirm"
                        type="password"
                        className={`${styles.input} ${errors.newPasswordConfirm ? styles.inputError : ""}`}
                        value={form.newPasswordConfirm}
                        onChange={handleChange}
                    />
                    {errors.newPasswordConfirm && (
                        <div className={styles.errorText}>{errors.newPasswordConfirm}</div>
                    )}
                </div>

                {/* 수정 버튼 */}
                <button type="submit" className={styles.button}>
                    수정하기
                </button>
            </form>
        </div>
    );
}

export default ProfileEdit;

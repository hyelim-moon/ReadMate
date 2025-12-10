import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/TeamChallengePage.module.css'; // 스타일 공유

const JoinTeamChallengeRoom = ({ onBack }) => {
    const [invitationCode, setInvitationCode] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleJoinRoom = async () => {
        if (!invitationCode.trim()) {
            setMessage('초대 코드를 입력해주세요.');
            setIsError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (!token) {
                setMessage("로그인이 필요합니다.");
                setIsError(true);
                setLoading(false);
                return;
            }

            // 실제 API 엔드포인트로 교체 필요
            const response = await axios.post('http://localhost:8080/api/team-challenges/join', {
                invitationCode: invitationCode
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage(response.data.message || '팀 경쟁 방에 성공적으로 참여했습니다!');
            setIsError(false);
            // 성공 시 추가적인 동작 (예: 방 상세 페이지로 이동)
            // navigate(`/team-challenges/${response.data.teamChallengeId}`);
        } catch (err) {
            console.error("방 참여 실패:", err);
            setMessage(err.response?.data?.message || '방 참여에 실패했습니다. 초대 코드를 확인해주세요.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.joinRoomContainer}>
            <h2 className={styles.subPageTitle}>팀 경쟁 방 참여하기</h2>
            {message && (
                <p className={isError ? styles.errorMessage : styles.successMessage}>
                    {message}
                </p>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="invitationCode" className={styles.formLabel}>초대 코드:</label>
                <input
                    type="text"
                    id="invitationCode"
                    className={styles.formInput}
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="초대 코드를 입력하세요"
                />
            </div>

            <button className={styles.actionButton} onClick={handleJoinRoom} disabled={loading}>
                {loading ? '참여 중...' : '방 참여하기'}
            </button>

            <button className={styles.backButton} onClick={onBack}>뒤로가기</button>
        </div>
    );
};

export default JoinTeamChallengeRoom;


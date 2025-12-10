import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/TeamChallengePage.module.css'; // 스타일 공유
import { FaCheckCircle } from 'react-icons/fa'; // 체크 아이콘 추가

const CreateTeamChallengeRoom = ({ onBack }) => {
    const [roomName, setRoomName] = useState('');
    const [challengeTitle, setChallengeTitle] = useState('');
    const [challengeDescription, setChallengeDescription] = useState('');
    const [endDate, setEndDate] = useState('');
    const [goalQuantity, setGoalQuantity] = useState(1); // 기본값 1권
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [invitationCode, setInvitationCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem("ACCESS_TOKEN");
                if (!token) {
                    setError("로그인이 필요합니다.");
                    setLoading(false);
                    return;
                }

                const meResponse = await axios.get('http://localhost:8080/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const userId = meResponse.data.id;

                if (!userId) {
                    setError("사용자 ID를 가져올 수 없습니다.");
                    setLoading(false);
                    return;
                }

                const friendsResponse = await axios.get(`http://localhost:8080/api/friends/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriends(friendsResponse.data);
            } catch (err) {
                console.error("친구 목록 불러오기 실패:", err);
                setError("친구 목록을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    const handleFriendSelect = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            alert('방 이름을 입력해주세요.');
            return;
        }
        if (!challengeTitle.trim()) {
            alert('챌린지 제목을 입력해주세요.');
            return;
        }
        if (!endDate) {
            alert('챌린지 종료 날짜를 선택해주세요.');
            return;
        }
        if (new Date(endDate) < new Date()) {
            alert('챌린지 종료 날짜는 오늘 이후여야 합니다.');
            return;
        }
        if (goalQuantity <= 0) {
            alert('챌린지 목표 수량은 1 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const response = await axios.post('http://localhost:8080/api/team-challenges/create', {
                roomName,
                invitedFriendIds: selectedFriends,
                challengeTitle,
                challengeDescription,
                endDate,
                goalQuantity,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitationCode(response.data.invitationCode);
            alert('팀 경쟁 방이 성공적으로 생성되었습니다!');
        } catch (err) {
            console.error("방 생성 실패:", err);
            setError(err.response?.data?.message || '방 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !friends.length && !error) {
        return <div className={styles.loadingMessage}>친구 목록을 불러오는 중...</div>;
    }

    return (
        <div className={styles.createRoomContainer}>
            <h2 className={styles.subPageTitle}>팀 경쟁 방 만들기</h2>
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.formGroup}>
                <label htmlFor="roomName" className={styles.formLabel}>방 이름:</label>
                <input
                    type="text"
                    id="roomName"
                    className={styles.formInput}
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="팀 경쟁 방 이름을 입력하세요"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="challengeTitle" className={styles.formLabel}>챌린지 제목:</label>
                <input
                    type="text"
                    id="challengeTitle"
                    className={styles.formInput}
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    placeholder="예: 10월 독서 마라톤"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="challengeDescription" className={styles.formLabel}>챌린지 설명:</label>
                <textarea
                    id="challengeDescription"
                    className={styles.formInput}
                    value={challengeDescription}
                    onChange={(e) => setChallengeDescription(e.target.value)}
                    placeholder="예: 10월 한 달 동안 책 5권 읽기"
                    rows="3"
                ></textarea>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="endDate" className={styles.formLabel}>챌린지 종료 날짜:</label>
                <input
                    type="date"
                    id="endDate"
                    className={styles.formInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="goalQuantity" className={styles.formLabel}>목표 수량 (권):</label>
                <input
                    type="number"
                    id="goalQuantity"
                    className={styles.formInput}
                    value={goalQuantity}
                    onChange={(e) => setGoalQuantity(Math.max(1, parseInt(e.target.value) || 1))} // 최소 1권
                    min="1"
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>친구 초대 (선택):</label>
                {friends.length === 0 ? (
                    <p className={styles.noFriendsMessage}>초대할 친구가 없습니다. 친구를 추가해보세요!</p>
                ) : (
                    <div className={styles.friendsGrid}>
                        {friends.map(friend => {
                            const isSelected = selectedFriends.includes(friend.id);
                            return (
                                <div
                                    key={friend.id}
                                    className={`${styles.friendCard} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => handleFriendSelect(friend.id)}
                                >
                                    {friend.profileImageUrl ? (
                                        <img
                                            src={friend.profileImageUrl}
                                            alt={friend.nickname}
                                            className={styles.friendCardImage}
                                        />
                                    ) : (
                                        <div className={`${styles.friendCardImage} ${styles.defaultFriendCardImage}`}></div>
                                    )}
                                    <p className={styles.friendCardName}>{friend.nickname}</p>
                                    {isSelected && <FaCheckCircle className={styles.checkIcon} />}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <button className={styles.actionButton} onClick={handleCreateRoom} disabled={loading}>
                {loading ? '생성 중...' : '방 만들기'}
            </button>

            {invitationCode && (
                <div className={styles.invitationCodeContainer}>
                    <p className={styles.invitationCodeLabel}>초대 코드:</p>
                    <p className={styles.invitationCode}>{invitationCode}</p>
                    <button
                        className={styles.copyButton}
                        onClick={() => navigator.clipboard.writeText(invitationCode)}
                    >
                        코드 복사
                    </button>
                </div>
            )}

            <button className={styles.backButton} onClick={onBack}>뒤로가기</button>
        </div>
    );
};

export default CreateTeamChallengeRoom;

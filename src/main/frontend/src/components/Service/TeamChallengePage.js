import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../assets/styles/TeamChallengePage.module.css';
import { FaPlusSquare, FaUsers } from 'react-icons/fa';
import CreateTeamChallengeRoom from './CreateTeamChallengeRoom';
import { useNavigate } from 'react-router-dom';

const TeamChallengePage = () => {
    const [view, setView] = useState('list');
    const [teamChallenges, setTeamChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchTeamChallenges = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/team-challenges');
            setTeamChallenges(response.data);
            setError(''); // 성공 시 에러 메시지 초기화
        } catch (err) {
            console.error("팀 챌린지 목록 불러오기 실패:", err);
            setError("팀 챌린지 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchTeamChallenges();
        }
    }, [view]);

    const handleCardClick = (teamChallengeId) => { // 카드 클릭 시 상세 페이지로 이동
        navigate(`/team-challenge/${teamChallengeId}`);
    };

    const handleJoinChallenge = async (teamChallengeId, event) => { // 버튼 클릭 시 즉시 참여
        event.stopPropagation(); // 이벤트 버블링 방지 (카드 클릭 이벤트와 중복 방지)

        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            alert('로그인 후 참여할 수 있습니다.');
            navigate('/login');
            return;
        }

        try {
            await axios.post(`http://localhost:8080/api/team-challenges/${teamChallengeId}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('팀 챌린지에 성공적으로 참여했습니다!');
            fetchTeamChallenges(); // 참여 후 목록 새로고침
        } catch (err) {
            console.error("팀 챌린지 참여 실패:", err);
            const errorMessage = err.response?.data?.message || '팀 챌린지 참여에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'create':
                return <CreateTeamChallengeRoom onBack={() => setView('list')} />;
            default: // 'list' view
                return (
                    <>
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>팀 경쟁</h1>
                            <button className={styles.createRoomButton} onClick={() => setView('create')}>
                                <FaPlusSquare className={styles.createRoomIcon} />
                                <span>방 만들기</span>
                            </button>
                        </div>
                        {loading && <p className={styles.loadingMessage}>방 목록을 불러오는 중...</p>}
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        {!loading && !error && (
                            <div className={styles.challengeGrid}>
                                {teamChallenges.length > 0 ? (
                                    teamChallenges.map(challenge => (
                                        <div 
                                            key={challenge.teamChallengeId} 
                                            className={styles.challengeCard}
                                            onClick={() => handleCardClick(challenge.teamChallengeId)} // 카드 클릭 이벤트 추가
                                        >
                                            <div className={styles.cardHeader}>
                                                <h3>{challenge.roomName}</h3>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <p className={styles.challengeTitle}>{challenge.challengeTitle}</p>
                                                <p className={styles.challengeDescription}>{challenge.challengeDescription}</p>
                                                <p className={styles.challengePeriod}>
                                                    {challenge.startDate} ~ {challenge.endDate} (목표: {challenge.goalQuantity}권)
                                                </p>
                                            </div>
                                            <div className={styles.cardFooter}>
                                                <div className={styles.memberInfo}>
                                                    <FaUsers />
                                                    <span>{challenge.currentMembers} / {challenge.maxMembers}</span>
                                                </div>
                                                <button 
                                                    className={styles.joinButton} // 클래스 이름 다시 joinButton으로
                                                    onClick={(event) => handleJoinChallenge(challenge.teamChallengeId, event)} // 즉시 참여 함수 호출
                                                >
                                                    참여하기 {/* 버튼 텍스트 다시 참여하기로 */}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noRoomsMessage}>참여 가능한 팀 경쟁 방이 없습니다. 새로운 방을 만들어보세요!</p>
                                )}
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div className={styles.teamChallengePage}>
            {renderContent()}
        </div>
    );
};

export default TeamChallengePage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/TeamChallengePage.module.css';
import { FaUsers, FaCalendarAlt, FaBookOpen, FaTrophy, FaCrown, FaEdit, FaTrashAlt } from 'react-icons/fa';

const TeamChallengeDetail = ({ isLoggedIn }) => {
    const { id } = useParams(); // URL에서 teamChallengeId 가져오기
    const navigate = useNavigate();
    const [challengeDetails, setChallengeDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMember, setIsMember] = useState(false); // 현재 사용자가 팀 멤버인지 여부
    const [isLeader, setIsLeader] = useState(false); // 현재 사용자가 방장인지 여부
    const [currentUserId, setCurrentUserId] = useState(null); // 현재 로그인한 사용자 ID

    useEffect(() => {
        const fetchChallengeDetails = async () => {
            try {
                setLoading(true);

                const response = await axios.get(`http://localhost:8080/api/team-challenges/${id}`);
                setChallengeDetails(response.data);

                const token = localStorage.getItem("ACCESS_TOKEN");
                if (token) {
                    const meResponse = await axios.get('http://localhost:8080/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const fetchedUserId = Number(meResponse.data.id); // Number로 명시적 변환
                    setCurrentUserId(fetchedUserId);

                    const challengeLeaderId = Number(response.data.leaderId); // Number로 명시적 변환

                    // 디버깅을 위한 console.log 추가 (이전과 동일하게 유지)
                    console.log('Fetched Challenge Details:', response.data);
                    console.log('Challenge Leader ID:', challengeLeaderId, typeof challengeLeaderId);
                    console.log('Current User ID:', fetchedUserId, typeof fetchedUserId);
                    console.log('Is Leader (comparison):', challengeLeaderId === fetchedUserId);


                    const memberExists = response.data.membersProgress.some(member => member.userId === fetchedUserId);
                    setIsMember(memberExists);

                    setIsLeader(challengeLeaderId === fetchedUserId); // 방장 여부 설정
                }

            } catch (err) {
                console.error("팀 챌린지 상세 정보 불러오기 실패:", err);
                setError("팀 챌린지 상세 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchChallengeDetails();
    }, [id]);

    const handleJoinChallenge = async () => {
        if (!isLoggedIn) {
            alert('로그인 후 참여할 수 있습니다.');
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            await axios.post(`http://localhost:8080/api/team-challenges/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('팀 챌린지에 성공적으로 참여했습니다!');
            setIsMember(true); // 참여 성공 시 상태 업데이트
            // 상세 정보 다시 불러오기 (멤버 목록 업데이트)
            const response = await axios.get(`http://localhost:8080/api/team-challenges/${id}`);
            setChallengeDetails(response.data);

        } catch (err) {
            console.error("팀 챌린지 참여 실패:", err);
            const errorMessage = err.response?.data?.message || '팀 챌린지 참여에 실패했습니다.';
            alert(errorMessage);
        }
    };

    const handleEditChallenge = () => {
        // 수정 페이지로 이동 (새로운 컴포넌트 필요)
        alert('수정 기능은 아직 구현되지 않았습니다.');
        // navigate(`/team-challenge/${id}/edit`);
    };

    const handleDeleteChallenge = async () => {
        if (!window.confirm('정말로 이 팀 경쟁을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            await axios.delete(`http://localhost:8080/api/team-challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('팀 경쟁이 성공적으로 삭제되었습니다.');
            navigate('/team-challenge'); // 목록 페이지로 이동
        } catch (err) {
            console.error("팀 경쟁 삭제 실패:", err);
            const errorMessage = err.response?.data?.message || '팀 경쟁 삭제에 실패했습니다.';
            alert(errorMessage);
        }
    };

    if (loading) {
        return <div className={styles.loadingMessage}>팀 챌린지 상세 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    if (!challengeDetails) {
        return <div className={styles.noRoomsMessage}>챌린지 정보를 찾을 수 없습니다.</div>;
    }

    const {
        roomName,
        challengeTitle,
        challengeDescription,
        startDate,
        endDate,
        goalQuantity,
        membersProgress,
        maxMembers,
        leaderId
    } = challengeDetails;

    return (
        <div className={styles.teamChallengeDetailPage}>
            <div className={styles.detailHeader}>
                <h1 className={styles.detailTitle}>{roomName}</h1>

                {isLeader && (
                    <div className={styles.leaderActions}>
                        <button className={styles.editButton} onClick={handleEditChallenge}>
                            <FaEdit /> 수정
                        </button>
                        <button className={styles.deleteButton} onClick={handleDeleteChallenge}>
                            <FaTrashAlt /> 삭제
                        </button>
                    </div>
                )}
                {!isLeader && !isMember && (
                    <button className={styles.joinChallengeButton} onClick={handleJoinChallenge}>
                        참여하기
                    </button>
                )}
                {!isLeader && isMember && (
                    <span className={styles.joinedStatus}>참여 중</span>
                )}
            </div>

            <div className={styles.challengeInfoCard}>
                <h2>{challengeTitle}</h2>
                <p className={styles.description}>{challengeDescription}</p>
                <div className={styles.infoRow}>
                    <FaCalendarAlt className={styles.infoIcon} />
                    <span>기간: {startDate} ~ {endDate}</span>
                </div>
                <div className={styles.infoRow}>
                    <FaBookOpen className={styles.infoIcon} />
                    <span>목표: {goalQuantity}권</span>
                </div>
            </div>

            <div className={styles.membersSection}>
                <h3><FaUsers className={styles.sectionIcon} /> 참여자 ({membersProgress.length} / {maxMembers})</h3>
                <div className={styles.memberGrid}>
                    {membersProgress.map(member => (
                        <div key={member.userId} className={styles.memberCard}>
                            {member.profileImageUrl ? (
                                <img src={member.profileImageUrl} alt={member.nickname} className={styles.memberImage} />
                            ) : (
                                <div className={`${styles.memberImage} ${styles.defaultMemberImage}`}></div>
                            )}
                            <p className={styles.memberNickname}>
                                {member.nickname} {member.isLeader && <FaCrown className={styles.leaderCrownIcon} />}
                            </p>
                            <p className={styles.memberProgress}>
                                <FaTrophy className={styles.progressIcon} /> {member.booksRead} / {goalQuantity} 권
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <button className={styles.backButton} onClick={() => navigate('/team-challenge')}>
                목록으로 돌아가기
            </button>
        </div>
    );
};

export default TeamChallengeDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/Challenge.module.css';

const ChallengesList = ({ challenges, setChallenges, loading }) => {
    const navigate = useNavigate();

    const handleParticipate = (e, challengeId, challengeStatus) => {
        e.stopPropagation();
        if (challengeStatus !== '참여 가능') {
            return;
        }

        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            if (window.confirm("회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?")) {
                navigate('/login');
            }
            return;
        } else {
            fetch(`http://localhost:8080/api/challenges/${challengeId}/participate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            .then(res => {
                if (res.ok) {
                    alert('챌린지 참여가 완료되었습니다.');
                    // UI 업데이트
                    const updatedChallenges = challenges.map(c => {
                        if (c.id === challengeId) {
                            return { 
                                ...c, 
                                participants: c.participants + 1, 
                                status: '참여중' // 상태를 '참여중'으로 변경
                            };
                        }
                        return c;
                    });
                    setChallenges(updatedChallenges);
                } else {
                    res.json().then(err => alert(err.message || '챌린지 참여에 실패했습니다.'));
                }
            })
            .catch(() => alert('네트워크 오류가 발생했습니다.'));
        }
    };
    
    if (loading) {
        return <div>챌린지 목록을 불러오는 중...</div>;
    }

    if (!Array.isArray(challenges) || challenges.length === 0) {
        return <div className={styles.emptyMessage}>현재 진행 중인 챌린지가 없습니다.</div>;
    }

    return (
        <div className={styles.challengeList}>
            {challenges.map(challenge => {
                const period = `${challenge.startDate} ~ ${challenge.endDate}`;
                const isParticipating = challenge.status === '참여중';
                const buttonStatusLabel = isParticipating ? '참여중' : (challenge.status === '진행중' ? '참여 가능' : challenge.status);
                const isDisabled = buttonStatusLabel !== '참여 가능';

                return (
                    <div
                        key={challenge.id}
                        className={`${styles.challengeCard} ${styles[buttonStatusLabel.replace(' ', '-')]}`}
                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/challenges/${challenge.id}`)}
                    >
                        <div className={styles.cardHeader}>
                            <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                            <span className={`${styles.challengeStatus} ${styles[`status${buttonStatusLabel}`]}`}>{buttonStatusLabel}</span>
                        </div>
                        <p className={styles.challengeDescription}>{challenge.description}</p>
                        <div className={styles.challengeInfo}>
                            <div><i className="fas fa-users"></i> {challenge.participants}명 참여</div>
                        </div>
                        <div className={styles.challengeInfo}>
                            <div><i className="fas fa-calendar-alt"></i> {period}</div>
                        </div>
                        <div className={styles.cardFooter}>
                            <p className={styles.challengeReward}><strong>보상:</strong> {challenge.reward} 포인트</p>
                            <button
                                className={styles.participateButton}
                                disabled={isDisabled}
                                onClick={(e) => handleParticipate(e, challenge.id, buttonStatusLabel)}
                            >
                                {buttonStatusLabel === '참여 가능' ? '참여하기' : buttonStatusLabel}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Leaderboard = ({ leaderboardData, loading, isLoggedIn, onLoginClick }) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <i className={`${styles.medal} ${styles.gold} fas fa-medal`}></i>;
            case 2: return <i className={`${styles.medal} ${styles.silver} fas fa-medal`}></i>;
            case 3: return <i className={`${styles.medal} ${styles.bronze} fas fa-medal`}></i>;
            default: return null;
        }
    };

    if (loading) {
        return <div>리더보드 정보를 불러오는 중...</div>;
    }

    return (
        <div>
            <table className={styles.leaderboardTable}>
                <thead>
                    <tr>
                        <th>순위</th>
                        <th>닉네임</th>
                        <th>보유 포인트</th>
                    </tr>
                </thead>
                <tbody>
                    {(!Array.isArray(leaderboardData) || leaderboardData.length === 0) ? (
                        <tr>
                            <td colSpan="3" className={styles.emptyMessage}>리더보드 정보가 없습니다.</td>
                        </tr>
                    ) : (
                        leaderboardData.map(user => (
                            <tr key={user.rank} className={user.isMe ? styles.myRankRow : ''}>
                                <td className={styles.rankCell}>
                                    {getRankIcon(user.rank)}
                                    <span>{user.rank}</span>
                                </td>
                                <td>{user.nickname}</td>
                                <td>{user.points}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {!isLoggedIn && (
                <div className={styles.myRankContainer}>
                    <p>로그인하고 내 순위를 확인하세요.</p>
                    <button onClick={onLoginClick} className={styles.loginButton}>로그인</button>
                </div>
            )}
        </div>
    );
};

const MyProgress = ({ progressData, loading, setProgressData }) => { // setProgressData 추가
    const navigate = useNavigate();

    const handleClaimReward = async (challengeId) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/challenges/${challengeId}/claim-reward`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const updatedChallenge = await response.json();
                alert(`챌린지 보상 ${updatedChallenge.reward} 포인트가 지급되었습니다!`);
                // UI 업데이트: 해당 챌린지의 isRewardClaimed 상태를 true로 변경
                setProgressData(prevData => prevData.map(c => 
                    c.id === challengeId ? { ...c, isRewardClaimed: true } : c
                ));
            } else {
                const errorData = await response.json();
                alert(errorData.message || '보상 수령에 실패했습니다.');
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    const handleAbandonChallenge = async (challengeId) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/login');
            return;
        }

        if (!window.confirm("정말로 챌린지를 포기하시겠습니까? 포기 시 진행 상황이 초기화됩니다.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/challenges/${challengeId}/abandon`, {
                method: 'DELETE', // DELETE 메서드 사용
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('챌린지를 포기했습니다.');
                // UI 업데이트: 해당 챌린지를 progressData에서 제거
                setProgressData(prevData => prevData.filter(c => c.id !== challengeId));
            } else {
                const errorData = await response.json();
                alert(errorData.message || '챌린지 포기에 실패했습니다.');
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return <div>진행 상황을 불러오는 중...</div>;
    }

    if (!Array.isArray(progressData) || progressData.length === 0) {
        return <p className={styles.emptyMessage}>아직 참여 중인 챌린지가 없습니다. 새로운 챌린지에 도전해보세요!</p>;
    }

    const inProgressChallenges = progressData.filter(c => c.status === '진행중' || c.status === '참여중');
    const completedChallenges = progressData.filter(c => c.status === '종료');

    return (
        <div>
            <section>
                <h2 className={styles.progressSectionTitle}>진행 중인 챌린지</h2>
                {inProgressChallenges.length > 0 ? (
                    <div className={styles.challengeList}>
                        {inProgressChallenges.map(challenge => {
                            const progressPercentage = (challenge.goal > 0) ? Math.min(100, (challenge.currentProgress / challenge.goal) * 100) : 0;

                            return (
                                <div key={challenge.id} 
                                     className={`${styles.challengeCard} ${styles[challenge.status.replace(' ', '-')]}`}
                                     onClick={() => navigate(`/challenges/${challenge.id}`)} // 카드 클릭 시 상세 페이지로 이동
                                     role="button"
                                     tabIndex={0}
                                     onKeyDown={(e) => e.key === 'Enter' && navigate(`/challenges/${challenge.id}`)}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                        <span className={styles.challengeStatus}>{challenge.status}</span>
                                    </div>
                                    <p className={styles.challengeDescription}>{challenge.description}</p>
                                    <div className={styles.challengeInfo}>
                                        <span><i className="fas fa-calendar-alt"></i> {challenge.startDate} ~ {challenge.endDate}</span>
                                    </div>
                                    <div className={styles.progressContainer}>
                                        <div 
                                            className={styles.progressBar} 
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className={styles.progressInfo}>
                                        <span>{challenge.currentProgress} / {challenge.goal}</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <p className={styles.challengeReward}><strong>보상:</strong> {challenge.reward} 포인트</p>
                                        {/* 진행 중인 챌린지에 포기하기 버튼 추가 */}
                                        <button 
                                            className={styles.abandonButton} 
                                            onClick={(e) => { e.stopPropagation(); handleAbandonChallenge(challenge.id); }}
                                        >
                                            포기하기
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyMessage}>현재 진행 중인 챌린지가 없습니다.</p>
                )}
            </section>

            <section>
                <h2 className={styles.progressSectionTitle}>완료한 챌린지</h2>
                {completedChallenges.length > 0 ? (
                    <div className={styles.challengeList}>
                        {completedChallenges.map(challenge => {
                            const isGoalMet = challenge.currentProgress >= challenge.goal;
                            const canClaimReward = challenge.status === '종료' && isGoalMet && !challenge.isRewardClaimed;

                            return (
                                <div key={challenge.id} 
                                     className={`${styles.challengeCard} ${styles[challenge.status.replace(' ', '-')]} ${challenge.status === '종료' ? styles.challengeEnded : ''}`}
                                     onClick={() => navigate(`/challenges/${challenge.id}`)}
                                     role="button"
                                     tabIndex={0}
                                     onKeyDown={(e) => e.key === 'Enter' && navigate(`/challenges/${challenge.id}`)}>
                                    <div className={styles.cardHeader}>
                                        <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                        <span className={styles.challengeStatus}>{challenge.status}</span>
                                    </div>
                                    <p className={styles.challengeDescription}>{challenge.description}</p>
                                    <div className={styles.challengeInfo}>
                                        <span><i className="fas fa-calendar-alt"></i> {challenge.startDate} ~ {challenge.endDate}</span>
                                    </div>
                                    <div className={styles.progressInfo}>
                                        <span>{challenge.currentProgress} / {challenge.goal}</span>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        {canClaimReward ? (
                                            <button 
                                                className={styles.claimRewardButton} 
                                                onClick={(e) => { e.stopPropagation(); handleClaimReward(challenge.id); }}
                                            >
                                                보상 받기 ({challenge.reward} 포인트)
                                            </button>
                                        ) : (
                                            challenge.isRewardClaimed ? (
                                                <p className={styles.rewardClaimedText}>보상 수령 완료</p>
                                            ) : (
                                                <p className={styles.challengeReward}><strong>보상:</strong> {challenge.reward} 포인트</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyMessage}>아직 완료한 챌린지가 없습니다.</p>
                )}
            </section>
        </div>
    );
};

const Challenge = () => {
    const [activeTab, setActiveTab] = useState('challenges');
    const [challenges, setChallenges] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem("ACCESS_TOKEN");

    useEffect(() => {
        setLoading(true);
        if (activeTab === 'challenges') {
            fetch('http://localhost:8080/api/challenges')
                .then(res => res.json())
                .then(data => {
                    setChallenges(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(() => {
                    setChallenges([]);
                    setLoading(false);
                });
        } else if (activeTab === 'leaderboard') {
            const rankingPromise = fetch('http://localhost:8080/api/users/ranking').then(res => {
                if (!res.ok) throw new Error('Failed to fetch ranking');
                return res.json();
            });

            const promises = [rankingPromise];

            if (isLoggedIn) {
                const token = localStorage.getItem("ACCESS_TOKEN");
                const myInfoPromise = fetch('http://localhost:8080/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch user info');
                    return res.json();
                });
                promises.push(myInfoPromise);
            }

            Promise.all(promises)
                .then(results => {
                    const rankingData = Array.isArray(results[0]) ? results[0].slice(0, 10) : [];
                    let finalLeaderboard = [...rankingData];

                    if (isLoggedIn && results.length > 1 && results[1]) {
                        const meData = results[1];
                        const myNickname = meData.nickname;

                        let userInTop10 = false;
                        finalLeaderboard = finalLeaderboard.map(user => {
                            if (user.nickname === myNickname) {
                                userInTop10 = true;
                                return { ...user, isMe: true };
                            }
                            return user;
                        });

                        if (!userInTop10) {
                            const myRankData = {
                                rank: 23, // 임시 순위 (백엔드 API 구현 필요)
                                nickname: myNickname,
                                points: meData.mileage,
                                isMe: true
                            };
                            finalLeaderboard.push(myRankData);
                        }
                    }
                    setLeaderboardData(finalLeaderboard);
                })
                .catch(err => {
                    console.error('Failed to fetch leaderboard data:', err);
                    setLeaderboardData([]);
                })
                .finally(() => {
                    setLoading(false);
                });

        } else if (activeTab === 'progress') {
            if (isLoggedIn) {
                const token = localStorage.getItem("ACCESS_TOKEN");
                fetch('http://localhost:8080/api/challenges/my-progress', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch my challenge progress');
                    }
                    return res.json();
                })
                .then(data => {
                    setProgressData(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch my challenge progress:', err);
                    setProgressData([]);
                    setLoading(false);
                });
            } else {
                setProgressData([]);
                setLoading(false);
            }
        }
    }, [activeTab, isLoggedIn]);

    const handleTabClick = (tab) => {
        if ((tab === 'progress' || tab === 'leaderboard') && !isLoggedIn) {
            if (window.confirm("회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?")) {
                navigate('/login');
            }
        } else {
            setActiveTab(tab);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'challenges':
                return <ChallengesList challenges={challenges} setChallenges={setChallenges} loading={loading} />;
            case 'leaderboard':
                return <Leaderboard 
                    leaderboardData={leaderboardData} 
                    loading={loading} 
                    isLoggedIn={isLoggedIn}
                    onLoginClick={() => navigate('/login')}
                />;
            case 'progress':
                return <MyProgress progressData={progressData} loading={loading} setProgressData={setProgressData} />;
            default:
                return <ChallengesList challenges={challenges} setChallenges={setChallenges} loading={loading} />;
        }
    };

    return (
        <div className className={styles.challengePage}>
            <div className={styles.headerContainer}>
                <h1 className={styles.pageTitle}>챌린지</h1>
            </div>
            <div className={styles.challengeTabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'challenges' ? styles.active : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    도전과제
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'leaderboard' ? styles.active : ''}`}
                    onClick={() => handleTabClick('leaderboard')}
                >
                    리더보드
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'progress' ? styles.active : ''}`}
                    onClick={() => handleTabClick('progress')}
                >
                    내 진행상황
                </button>
            </div>
            <div className={styles.challengeContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Challenge;

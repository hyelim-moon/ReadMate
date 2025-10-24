import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 추가
import styles from '../../assets/styles/Challenge.module.css';

// 샘플 데이터 (사용자 수정본 유지 및 '예정' 챌린지 이동)
const sampleChallenges = [
    {
        id: 1,
        title: '10월 독서 마라톤',
        description: '10월 한 달 동안 책 5권 읽기',
        reward: '500 포인트',
        participants: 123,
        period: '2025.10.31까지',
        status: '참여 중',
        currentProgress: 2,
        goal: 5,
    },
    {
        id: 2,
        title: '주말 독서 챌린지',
        description: '주말 동안 300페이지 이상 읽기',
        reward: '100 포인트',
        participants: 45,
        period: '2025.10.31까지',
        status: '참여 가능',
        currentProgress: 0,
        goal: 300,
    },
    {
        id: 3,
        title: '신년 목표: 독서왕',
        description: '새해 첫 주에 매일 독서 기록 남기기',
        reward: '300 포인트',
        participants: 78,
        period: '2024.01.07까지',
        status: '달성 완료',
        currentProgress: 7,
        goal: 7,
    },
    {
        id: 4,
        title: '연말 독서 챌린지',
        description: '12월 한 달간 매일 30분 이상 독서하기',
        reward: '1000 포인트',
        participants: 0,
        period: '2024.12.01 ~ 2024.12.31',
        status: '예정',
        currentProgress: 0,
        goal: 31,
    },
];

const sampleLeaderboard = [
    { rank: 1, userId: 'user123', challengesCompleted: 15, records: 120, points: 15000 },
    { rank: 2, userId: 'bookworm', challengesCompleted: 12, records: 105, points: 12500 },
    { rank: 3, userId: 'readmate', challengesCompleted: 10, records: 90, points: 10000 },
    { rank: 4, userId: '독서광', challengesCompleted: 8, records: 85, points: 9000 },
    { rank: 5, userId: 'pobi', challengesCompleted: 7, records: 77, points: 8500 },
];

// '예정' 챌린지 제거
const sampleMyProgress = [
    {
        id: 1,
        title: '1월 독서 마라톤',
        description: '1월 한 달 동안 책 5권 읽기',
        reward: '500 포인트',
        period: '2024.01.01 ~ 2024.01.31',
        status: '참여 중',
        currentProgress: 2,
        goal: 5,
        myStartDate: '2024.01.03',
    },
    {
        id: 3,
        title: '신년 목표: 독서왕',
        description: '새해 첫 주에 매일 독서 기록 남기기',
        reward: '300 포인트',
        period: '2024.01.01 ~ 2024.01.07',
        status: '달성 완료',
        currentProgress: 7,
        goal: 7,
        myCompletionDate: '2024.01.06',
    },
];

const ChallengesList = ({ challenges }) => {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleParticipate = (e, challengeId, challengeStatus) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        if (challengeStatus !== '참여 가능') {
            return; // '참여 가능' 상태가 아니면 아무것도 하지 않음
        }

        const token = localStorage.getItem("ACCESS_TOKEN");

        if (!token) {
            if (window.confirm("회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?")) {
                navigate('/login');
            }
            return;
        } else {
            // 실제 참여 로직
            alert(`챌린지 ${challengeId}에 참여합니다!`);
            // 예: 챌린지 참여 API 호출
        }
    };

    return (
        <div className={styles.challengeList}>
            {challenges.map(challenge => (
                <div 
                    key={challenge.id} 
                    className={`${styles.challengeCard} ${styles[challenge.status.replace(' ', '-')]}`}
                    onClick={() => navigate(`/challenges/${challenge.id}`)} // 카드 클릭 시 상세 페이지로 이동
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            navigate(`/challenges/${challenge.id}`);
                        }
                    }}
                >
                    <div className={styles.cardHeader}>
                        <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                        <span className={`${styles.challengeStatus} ${challenge.status === '예정' ? styles.statusUpcoming : ''}`}>{challenge.status}</span>
                    </div>
                    <p className={styles.challengeDescription}>{challenge.description}</p>
                    <div className={styles.challengeInfo}>
                        <span><i className="fas fa-users"></i> {challenge.participants}명 참여</span>
                        <span><i className="fas fa-calendar-alt"></i> {challenge.period}</span>
                    </div>
                    {challenge.status !== '예정' && (
                        <>
                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar} style={{ width: `${(challenge.currentProgress / challenge.goal) * 100}%` }}></div>
                            </div>
                            <div className={styles.progressInfo}>
                                <span>{challenge.currentProgress} / {challenge.goal}</span>
                            </div>
                        </>
                    )}
                    <div className={styles.cardFooter}>
                        <p className={styles.challengeReward}><strong>보상:</strong> {challenge.reward}</p>
                        <button 
                            className={styles.participateButton} 
                            disabled={challenge.status !== '참여 가능'}
                            onClick={(e) => handleParticipate(e, challenge.id, challenge.status)} // 이벤트 객체 전달
                        >
                            {challenge.status === '참여 가능' ? '참여하기' : (challenge.status === '예정' ? '예정' : '진행 중')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Leaderboard = ({ leaderboardData }) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <i className={`${styles.medal} ${styles.gold} fas fa-medal`}></i>;
            case 2: return <i className={`${styles.medal} ${styles.silver} fas fa-medal`}></i>;
            case 3: return <i className={`${styles.medal} ${styles.bronze} fas fa-medal`}></i>;
            default: return null;
        }
    };

    return (
        <table className={styles.leaderboardTable}>
            <thead>
                <tr>
                    <th>순위</th>
                    <th>아이디</th>
                    <th>챌린지 달성</th>
                    <th>독서 기록</th>
                    <th>보유 포인트</th>
                </tr>
            </thead>
            <tbody>
                {leaderboardData.map(user => (
                    <tr key={user.rank}>
                        <td className={styles.rankCell}>
                            {getRankIcon(user.rank)}
                            <span>{user.rank}</span>
                        </td>
                        <td>{user.userId}</td>
                        <td>{user.challengesCompleted}</td>
                        <td>{user.records}</td>
                        <td>{user.points}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const MyProgress = ({ progressData }) => {
    const inProgressChallenges = progressData.filter(c => c.status === '참여 중');
    const completedChallenges = progressData.filter(c => c.status === '달성 완료');

    if (progressData.length === 0) {
        return <p className={styles.emptyMessage}>아직 참여 중인 챌린지가 없습니다. 새로운 챌린지에 도전해보세요!</p>;
    }

    return (
        <div>
            <section>
                <h2 className={styles.progressSectionTitle}>진행 중인 챌린지</h2>
                {inProgressChallenges.length > 0 ? (
                    <div className={styles.challengeList}>
                        {inProgressChallenges.map(challenge => (
                            <div key={challenge.id} className={`${styles.challengeCard} ${styles[challenge.status.replace(' ', '-')]}`}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                    <span className={styles.challengeStatus}>{challenge.status}</span>
                                </div>
                                <p className={styles.challengeDescription}>{challenge.description}</p>
                                <div className={styles.challengeInfo}>
                                    <span><i className="fas fa-calendar-alt"></i> {challenge.period}</span>
                                    <span><i className="fas fa-play-circle"></i> 시작일: {challenge.myStartDate}</span>
                                </div>
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar} style={{ width: `${(challenge.currentProgress / challenge.goal) * 100}%` }}></div>
                                </div>
                                <div className={styles.progressInfo}>
                                    <span>{challenge.currentProgress} / {challenge.goal}</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <p className={styles.challengeReward}><strong>보상:</strong> {challenge.reward}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.emptyMessage}>현재 진행 중인 챌린지가 없습니다.</p>
                )}
            </section>

            <section>
                <h2 className={styles.progressSectionTitle}>완료한 챌린지</h2>
                {completedChallenges.length > 0 ? (
                    <div className={styles.challengeList}>
                        {completedChallenges.map(challenge => (
                            <div key={challenge.id} className={`${styles.challengeCard} ${styles[challenge.status.replace(' ', '-')]}`}>
                                <div className={styles.cardHeader}>
                                    <h3 className={styles.challengeTitle}>{challenge.title}</h3>
                                    <span className={styles.challengeStatus}>{challenge.status}</span>
                                </div>
                                <p className={styles.challengeDescription}>{challenge.description}</p>
                                <div className={styles.challengeInfo}>
                                    <span><i className="fas fa-calendar-alt"></i> {challenge.period}</span>
                                    <span><i className="fas fa-check-circle"></i> 완료일: {challenge.myCompletionDate}</span>
                                </div>
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressBar} style={{ width: `100%` }}></div>
                                </div>
                                <div className={styles.progressInfo}>
                                    <span>달성 완료!</span>
                                </div>
                                <div className={styles.cardFooter}>
                                    <p className={styles.challengeReward}><strong>획득 보상:</strong> {challenge.reward}</p>
                                </div>
                            </div>
                        ))}
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

    const renderContent = () => {
        switch (activeTab) {
            case 'challenges':
                return <ChallengesList challenges={sampleChallenges} />;
            case 'leaderboard':
                return <Leaderboard leaderboardData={sampleLeaderboard} />;
            case 'progress':
                return <MyProgress progressData={sampleMyProgress} />;
            default:
                return <ChallengesList challenges={sampleChallenges} />;
        }
    };

    return (
        <div className={styles.challengePage}>
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
                    onClick={() => setActiveTab('leaderboard')}
                >
                    리더보드
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'progress' ? styles.active : ''}`}
                    onClick={() => setActiveTab('progress')}
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

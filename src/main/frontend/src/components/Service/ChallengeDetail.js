
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/Challenge.module.css';

// 샘플 데이터 (실제로는 API 또는 공유 데이터 소스에서 가져와야 함)
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

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const challenge = sampleChallenges.find(c => c.id === parseInt(id));
    const [activeTab, setActiveTab] = useState('overview');

    const handleParticipate = (e) => {
        e.stopPropagation();
        if (challenge.status !== '참여 가능') return;

        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            if (window.confirm("회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?")) {
                navigate('/login');
            }
        } else {
            alert(`챌린지 '${challenge.title}'에 참여합니다!`);
            // 여기에 챌린지 참여 API 호출 로직을 추가할 수 있습니다.
        }
    };

    if (!challenge) {
        return (
            <div className={styles.challengePage}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.pageTitle}>챌린지 정보</h1>
                </div>
                <div className={styles.challengeContent}>
                    <p className={styles.emptyMessage}>해당 챌린지를 찾을 수 없습니다.</p>
                </div>
            </div>
        );
    }

    const renderOverview = () => (
        <div className={styles.overviewSection}>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>기간</h3>
                <p>{challenge.period}</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>목표</h3>
                <p>{challenge.description}</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>보상</h3>
                <p>{challenge.reward}</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>참여방법</h3>
                <p>챌린지 기간 동안 조건에 맞게 독서하고 독서 기록을 남겨주세요.</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>인증방법</h3>
                <p>Readmate에 독서 기록을 남기면 자동으로 인증됩니다.</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>주의사항</h3>
                <ul className={styles.notesList}>
                    <li>챌린지 기간 내에 작성된 독서 기록만 인정됩니다.</li>
                    <li>비공개 독서 기록은 챌린지 진행률에 포함되지 않습니다.</li>
                    <li>챌린지 보상은 챌린지 종료 후 일괄 지급됩니다.</li>
                </ul>
            </div>
        </div>
    );

    const renderProgress = () => (
        <div className={styles.myProgressSection}>
            {/* 실제 앱에서는 사용자의 특정 챌린지 진행 상황을 가져와 표시합니다. */}
            <p className={styles.emptyMessage}>아직 이 챌린지에 대한 진행 상황이 없습니다.</p>
        </div>
    );

    return (
        <div className={styles.challengePage}>
            <div className={styles.headerContainer}>
                <h1 className={styles.pageTitle}>{challenge.title}</h1>
                <button onClick={() => navigate('/challenge')} className={styles.backButton}>
                    목록으로
                </button>
            </div>

            <div className={styles.challengeTabs}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    개요
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'progress' ? styles.active : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    진행상황
                </button>
            </div>

            <div className={styles.challengeContent}>
                {activeTab === 'overview' ? renderOverview() : renderProgress()}
            </div>
        </div>
    );
};

export default ChallengeDetail;

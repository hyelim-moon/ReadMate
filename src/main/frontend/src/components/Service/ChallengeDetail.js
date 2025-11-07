import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/Challenge.module.css';

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const isLoggedIn = !!localStorage.getItem("ACCESS_TOKEN");

    useEffect(() => {
        const fetchChallengeDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("ACCESS_TOKEN");
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`http://localhost:8080/api/challenges/${id}/details`, {
                    headers: headers,
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch challenge details');
                }
                const data = await response.json();
                setChallenge(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChallengeDetails();
    }, [id, isLoggedIn]); // id와 로그인 상태가 변경될 때마다 다시 불러오도록

    const handleParticipate = async (e) => {
        e.stopPropagation();
        if (challenge.status !== '참여 가능') return;

        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            if (window.confirm("회원 전용 서비스입니다.\n로그인이 필요합니다.\n지금 로그인하시겠습니까?")) {
                navigate('/login');
            }
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/challenges/${challenge.id}/participate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert('챌린지 참여가 완료되었습니다.');
                // 참여 후 챌린지 상세 정보를 다시 불러와 UI 업데이트
                const updatedChallengeResponse = await fetch(`http://localhost:8080/api/challenges/${challenge.id}/details`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const updatedChallengeData = await updatedChallengeResponse.json();
                setChallenge(updatedChallengeData);
            } else {
                const err = await response.json();
                alert(err.message || '챌린지 참여에 실패했습니다.');
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
        }
    };

    if (loading) {
        return (
            <div className={styles.challengePage}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.pageTitle}>챌린지 정보</h1>
                </div>
                <div className={styles.challengeContent}>
                    <p className={styles.emptyMessage}>챌린지 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.challengePage}>
                <div className={styles.headerContainer}>
                    <h1 className={styles.pageTitle}>챌린지 정보</h1>
                </div>
                <div className={styles.challengeContent}>
                    <p className={styles.emptyMessage}>오류 발생: {error}</p>
                </div>
            </div>
        );
    }

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

    const progressPercentage = (challenge.goal > 0) ? Math.min(100, (challenge.currentProgress / challenge.goal) * 100) : 0;

    const renderOverview = () => (
        <div className={styles.overviewSection}>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>기간</h3>
                <p>{challenge.startDate} ~ {challenge.endDate}</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>목표</h3>
                <p>{challenge.description}</p>
            </div>
            <div className={styles.overviewItem}>
                <h3 className={styles.overviewTitle}>보상</h3>
                <p>{challenge.reward} 포인트</p>
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

    const renderProgressTabContent = () => {
        return (
            <div>
                <section>
                    <h2 className={styles.progressSectionTitle}>내 챌린지 현황</h2>
                    {isLoggedIn ? (
                        <div className={styles.myProgressSection}>
                            <p>나의 진행률: {challenge.currentProgress} / {challenge.goal}</p>
                            <div className={styles.progressContainer} style={{marginTop: '1rem'}}>
                                <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            {challenge.relatedLink && (
                                <div className={styles.actionButtonContainer}>
                                    <button onClick={() => navigate(challenge.relatedLink)} className={styles.actionButton}>
                                        {challenge.relatedLinkText}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.loginPrompt}>
                            <p>로그인하고 챌린지 진행 현황을 확인해보세요!</p>
                            <button onClick={() => navigate('/login')} className={styles.loginButton}>로그인</button>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className={styles.progressSectionTitle}>참가자 현황</h2>
                    {challenge.participants > 0 ? (
                        <p className={styles.participantText}>
                            현재 총 {challenge.participants}명이 참여하고 있습니다.
                        </p>
                    ) : (
                        <p className={styles.emptyMessage}>아직 참가자가 없습니다.</p>
                    )}
                </section>
            </div>
        );
    };

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
                    챌린지 개요
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'progress' ? styles.active : ''}`}
                    onClick={() => setActiveTab('progress')}
                >
                    진행상황
                </button>
            </div>

            <div className={styles.challengeContent}>
                {activeTab === 'overview' ? renderOverview() : renderProgressTabContent()}
            </div>
        </div>
    );
};

export default ChallengeDetail;

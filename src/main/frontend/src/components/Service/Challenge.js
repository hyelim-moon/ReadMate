import React, { useState } from 'react';

const Challenge = () => {
    const [activeTab, setActiveTab] = useState('challenges');

    const renderContent = () => {
        switch (activeTab) {
            case 'challenges':
                return <div>도전과제 내용</div>;
            case 'leaderboard':
                return <div>리더보드 내용</div>;
            case 'progress':
                return <div>내 진행상황 내용</div>;
            default:
                return <div>도전과제 내용</div>;
        }
    };

    return (
        <div className="challenge-container">
            <div className="challenge-header">
                <h1>챌린지</h1>
            </div>
            <div className="challenge-tabs">
                <button
                    className={activeTab === 'challenges' ? 'active' : ''}
                    onClick={() => setActiveTab('challenges')}
                >
                    도전과제
                </button>
                <button
                    className={activeTab === 'leaderboard' ? 'active' : ''}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    리더보드
                </button>
                <button
                    className={activeTab === 'progress' ? 'active' : ''}
                    onClick={() => setActiveTab('progress')}
                >
                    내 진행상황
                </button>
            </div>
            <div className="challenge-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Challenge;

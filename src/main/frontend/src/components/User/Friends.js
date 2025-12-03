import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/styles/Friends.module.css';
import { FiChevronLeft, FiMessageCircle, FiXCircle, FiUserPlus, FiSearch, FiRefreshCw } from 'react-icons/fi'; // FiRefreshCw 임포트

// 초기 가상 친구 데이터 (상수로 정의하여 새로고침 시 사용)
const initialMyFriends = [
    { id: 1, nickname: '책벌레' },
    { id: 2, nickname: '독서왕' },
    { id: 3, nickname: '리드메이트' },
    { id: 4, nickname: '글쓴이' },
    { id: 5, nickname: '페이지터너' },
];

// 초기 가상 추천 친구 데이터 (상수로 정의하여 새로고침 시 사용)
const initialRecommendedFriends = [
    { id: 6, nickname: '새로운친구1' },
    { id: 7, nickname: '새로운친구2' },
    { id: 8, nickname: '새로운친구3' },
    { id: 9, nickname: '독서친구' },
    { id: 10, nickname: '책사랑' },
];

function Friends() {
    // 가상 친구 데이터 (useState로 관리)
    const [myFriends, setMyFriends] = useState(initialMyFriends);

    // 가상 추천 친구 데이터 (useState로 관리)
    const [recommendedFriends, setRecommendedFriends] = useState(initialRecommendedFriends);

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        // 실제 검색 로직은 백엔드 API 호출 등으로 구현될 수 있습니다.
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 친구 추가 핸들러
    const handleAddFriend = (friendToAdd) => {
        // 이미 친구 목록에 있는지 확인 (중복 추가 방지)
        if (!myFriends.some(f => f.id === friendToAdd.id)) {
            setMyFriends(prevFriends => [...prevFriends, friendToAdd]);
            setRecommendedFriends(prevRecFriends =>
                prevRecFriends.filter(f => f.id !== friendToAdd.id)
            );
            console.log(`${friendToAdd.nickname} 님을 친구로 추가했습니다.`);
        } else {
            console.log(`${friendToAdd.nickname} 님은 이미 친구입니다.`);
        }
    };

    // 친구 삭제 핸들러
    const handleDeleteFriend = (friendToDelete) => {
        setMyFriends(prevFriends =>
            prevFriends.filter(f => f.id !== friendToDelete.id)
        );
        // 삭제된 친구를 추천 친구 목록으로 다시 보낼 수도 있습니다.
        // 여기서는 단순히 삭제만 합니다.
        console.log(`${friendToDelete.nickname} 님을 친구 목록에서 삭제했습니다.`);
    };

    // 추천 친구 목록 새로고침 핸들러
    const handleRefreshRecommendedFriends = () => {
        setRecommendedFriends(initialRecommendedFriends); // 초기 상태로 되돌림
        console.log('추천 친구 목록을 새로고침했습니다.');
    };

    // 내 친구 목록 필터링
    const filteredMyFriends = myFriends.filter(friend =>
        friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 추천 친구 목록 필터링
    const filteredRecommendedFriends = recommendedFriends.filter(recFriend =>
        recFriend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <> {/* 최상위 div 대신 Fragment 사용 */}
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>친구</h1>
            </div>

            <div className={styles.container}>
                <main className={styles.mainContent}>
                    {/* 검색 섹션 */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}><FiSearch /> 친구 검색</h2>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="친구 닉네임 검색"
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={onKeyPress}
                            />
                            <button className={styles.searchButton} onClick={handleSearch}>
                                <FiSearch />
                            </button>
                        </div>
                    </section>

                    {/* 내 친구 섹션 */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>내 친구</h2>
                        <div className={styles.friendList}>
                            {filteredMyFriends.length === 0 ? (
                                <div className={styles.emptyBox}>
                                    {searchTerm ? `'${searchTerm}'에 해당하는 친구가 없습니다.` : '친구가 없습니다.'}
                                </div>
                            ) : (
                                filteredMyFriends.map(friend => (
                                    <div key={friend.id} className={styles.friendItem}>
                                        <div className={styles.friendInfo}>
                                            <div className={styles.friendImage} />
                                            <span className={styles.friendNickname}>{friend.nickname}</span>
                                        </div>
                                        <div className={styles.friendActions}>
                                            <button className={`${styles.actionButton} ${styles.chatButton}`}>
                                                <FiMessageCircle />
                                                <span>채팅</span>
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleDeleteFriend(friend)} // 삭제 버튼 연결
                                            >
                                                <FiXCircle />
                                                <span>삭제</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* 추천 친구 섹션 */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>
                            추천 친구
                            <button
                                className={`${styles.actionButton} ${styles.refreshButton}`} // 새로고침 버튼 스타일 추가
                                onClick={handleRefreshRecommendedFriends} // 새로고침 핸들러 연결
                                title="추천 친구 새로고침"
                            >
                                <FiRefreshCw />
                            </button>
                        </h2>
                        <div className={styles.recommendedFriendList}>
                            {filteredRecommendedFriends.length === 0 ? (
                                <div className={styles.emptyBox}>
                                    {searchTerm ? `'${searchTerm}'에 해당하는 추천 친구가 없습니다.` : '추천 친구가 없습니다.'}
                                </div>
                            ) : (
                                filteredRecommendedFriends.map(recFriend => (
                                    <div key={recFriend.id} className={styles.recommendedFriendItem}>
                                        <div className={styles.friendInfo}>
                                            <div className={styles.friendImage} />
                                            <span className={styles.friendNickname}>{recFriend.nickname}</span>
                                        </div>
                                        <div className={styles.friendActions}>
                                            <button
                                                className={`${styles.actionButton} ${styles.addButton}`}
                                                onClick={() => handleAddFriend(recFriend)} // 추가 버튼 연결
                                            >
                                                <FiUserPlus />
                                                <span>추가</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

export default Friends;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../../assets/styles/Friends.module.css';
import { FiMessageCircle, FiXCircle, FiUserPlus, FiSearch, FiRefreshCw, FiCheckCircle } from 'react-icons/fi'; // FiCheckCircle 추가

function Friends() {
    const [myFriends, setMyFriends] = useState([]);
    const [recommendedFriends, setRecommendedFriends] = useState([]);
    const [pendingReceivedRequests, setPendingReceivedRequests] = useState([]); // 받은 친구 요청 목록
    const [pendingSentRequests, setPendingSentRequests] = useState([]);     // 보낸 친구 요청 목록
    const [searchTerm, setSearchTerm] = useState('');

    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [currentView, setCurrentView] = useState('myFriends'); // 'myFriends', 'pendingReceived', 'pendingSent'

    useEffect(() => {
        const storedUserId = localStorage.getItem("USER_ID");
        const storedToken = localStorage.getItem("ACCESS_TOKEN");

        if (storedUserId && storedToken) {
            setUserId(Number(storedUserId));
            setToken(storedToken);
        } else {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
        }
    }, []);

    const getAuthHeaders = () => {
        if (!token) {
            throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    // 에러 메시지 추출 헬퍼 함수
    const getErrorMessage = (error, defaultMessage) => {
        if (error.response && error.response.data) {
            // Spring Boot 기본 에러 형식 (message, error 필드)
            if (typeof error.response.data === 'string') {
                return error.response.data;
            }
            if (error.response.data.message) {
                return error.response.data.message;
            }
            if (error.response.data.error) {
                return error.response.data.error;
            }
        }
        return defaultMessage;
    };

    const fetchFriendsData = async () => {
        if (!userId || !token) return;

        try {
            const headers = getAuthHeaders();

            // 내 친구 목록 불러오기
            const myFriendsResponse = await axios.get(`http://localhost:8080/api/friends/${userId}`, headers);
            setMyFriends(myFriendsResponse.data);

            // 추천 친구 목록 불러오기
            const recommendedFriendsResponse = await axios.get(`http://localhost:8080/api/friends/recommendations/${userId}`, headers);
            setRecommendedFriends(recommendedFriendsResponse.data);

            // 받은 친구 요청 목록 불러오기
            const pendingReceivedResponse = await axios.get(`http://localhost:8080/api/friends/pending-requests/${userId}`, headers);
            setPendingReceivedRequests(pendingReceivedResponse.data);

            // 보낸 친구 요청 목록 불러오기
            const pendingSentResponse = await axios.get(`http://localhost:8080/api/friends/sent-requests/${userId}`, headers);
            setPendingSentRequests(pendingSentResponse.data); // 이 부분은 유지

            setMessage('');
            setIsError(false);
        } catch (error) {
            console.error("친구 데이터를 불러오는 데 실패했습니다:", error);
            setMessage(getErrorMessage(error, '친구 데이터를 불러오는 데 실패했습니다.'));
            setIsError(true);
        }
    };

    useEffect(() => {
        if (userId && token) {
            fetchFriendsData();
        }
    }, [userId, token]);

    // pendingSentRequests 상태가 변경될 때마다 로그 출력
    useEffect(() => {
        console.log("Current pendingSentRequests state:", pendingSentRequests);
    }, [pendingSentRequests]);


    const handleSearch = () => {
        console.log('Searching for:', searchTerm);
        // 백엔드에 검색 API가 있다면 여기에 호출 로직 추가
    };

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleAddFriend = async (friendToAdd) => {
        if (!userId || !token) {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.post(`http://localhost:8080/api/friends/request/${userId}`, { addresseeId: friendToAdd.id }, headers);
            setMessage(`${friendToAdd.nickname} 님에게 친구 요청을 보냈습니다.`);
            setIsError(false);
            fetchFriendsData();
        } catch (error) {
            console.error("친구 요청 실패:", error);
            setMessage(getErrorMessage(error, '친구 요청에 실패했습니다.'));
            setIsError(true);
        }
    };

    const handleDeleteFriend = async (friendToDelete) => {
        if (!userId || !token) {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.delete(`http://localhost:8080/api/friends/${userId}/${friendToDelete.id}`, headers);
            setMessage(`${friendToDelete.nickname} 님을 친구 목록에서 삭제했습니다.`);
            setIsError(false);
            fetchFriendsData();
        } catch (error) {
            console.error("친구 삭제 실패:", error);
            setMessage(getErrorMessage(error, '친구 삭제에 실패했습니다.'));
            setIsError(true);
        }
    };

    // 받은 친구 요청 수락
    const handleAcceptRequest = async (request) => {
        if (!userId || !token) {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.put(`http://localhost:8080/api/friends/accept/${request.friendshipId}/${userId}`, {}, headers);
            setMessage(`${request.nickname} 님의 친구 요청을 수락했습니다.`);
            setIsError(false);
            fetchFriendsData();
        } catch (error) {
            console.error("친구 요청 수락 실패:", error);
            setMessage(getErrorMessage(error, '친구 요청 수락에 실패했습니다.'));
            setIsError(true);
        }
    };

    // 받은 친구 요청 거절
    const handleRejectRequest = async (request) => {
        if (!userId || !token) {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.put(`http://localhost:8080/api/friends/reject/${request.friendshipId}/${userId}`, {}, headers);
            setMessage(`${request.nickname} 님의 친구 요청을 거절했습니다.`);
            setIsError(false);
            fetchFriendsData();
        } catch (error) {
            console.error("친구 요청 거절 실패:", error);
            setMessage(getErrorMessage(error, '친구 요청 거절에 실패했습니다.'));
            setIsError(true);
        }
    };

    // 보낸 친구 요청 취소 (백엔드 reject 엔드포인트 재활용)
    const handleCancelRequest = async (request) => {
        if (!userId || !token) {
            setMessage("로그인이 필요합니다.");
            setIsError(true);
            return;
        }
        try {
            const headers = getAuthHeaders();
            await axios.put(`http://localhost:8080/api/friends/reject/${request.friendshipId}/${userId}`, {}, headers);
            setMessage(`${request.nickname} 님에게 보낸 친구 요청을 취소했습니다.`);
            setIsError(false);
            fetchFriendsData();
        } catch (error) {
            console.error("친구 요청 취소 실패:", error);
            setMessage(getErrorMessage(error, '친구 요청 취소에 실패했습니다.'));
            setIsError(true);
        }
    };

    const handleRefreshRecommendedFriends = () => {
        fetchFriendsData();
        setMessage('추천 친구 목록을 새로고침했습니다.');
        setIsError(false);
    };

    const filteredMyFriends = myFriends.filter(friend =>
        friend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRecommendedFriends = recommendedFriends.filter(recFriend =>
        recFriend.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPendingReceivedRequests = pendingReceivedRequests.filter(request =>
        request.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPendingSentRequests = pendingSentRequests.filter(request =>
        request.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>친구</h1>
            </div>

            <div className={styles.container}>
                <main className={styles.mainContent}>
                    {message && (
                        <p className={isError ? styles.errorMessage : styles.successMessage}>
                            {message}
                        </p>
                    )}

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

                    {/* 탭 메뉴 */}
                    <div className={styles.tabMenu}>
                        <button
                            className={`${styles.tabButton} ${currentView === 'myFriends' ? styles.activeTab : ''}`}
                            onClick={() => setCurrentView('myFriends')}
                        >
                            내 친구
                        </button>
                        <button
                            className={`${styles.tabButton} ${currentView === 'pendingReceived' ? styles.activeTab : ''}`}
                            onClick={() => setCurrentView('pendingReceived')}
                        >
                            받은 요청 ({pendingReceivedRequests.length})
                        </button>
                        <button
                            className={`${styles.tabButton} ${currentView === 'pendingSent' ? styles.activeTab : ''}`}
                            onClick={() => setCurrentView('pendingSent')}
                        >
                            보낸 요청 ({pendingSentRequests.length})
                        </button>
                    </div>

                    {/* 내 친구 섹션 */}
                    {currentView === 'myFriends' && (
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
                                                    onClick={() => handleDeleteFriend(friend)}
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
                    )}

                    {/* 받은 친구 요청 섹션 */}
                    {currentView === 'pendingReceived' && (
                        <section className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>받은 친구 요청</h2>
                            <div className={styles.friendList}>
                                {filteredPendingReceivedRequests.length === 0 ? (
                                    <div className={styles.emptyBox}>
                                        {searchTerm ? `'${searchTerm}'에 해당하는 받은 요청이 없습니다.` : '받은 친구 요청이 없습니다.'}
                                    </div>
                                ) : (
                                    filteredPendingReceivedRequests.map(request => (
                                        <div key={request.friendshipId} className={styles.friendItem}>
                                            <div className={styles.friendInfo}>
                                                <div className={styles.friendImage} />
                                                <span className={styles.friendNickname}>{request.nickname}</span>
                                            </div>
                                            <div className={styles.friendActions}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.acceptButton}`}
                                                    onClick={() => handleAcceptRequest(request)}
                                                >
                                                    <FiCheckCircle />
                                                    <span>수락</span>
                                                </button>
                                                <button
                                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                                    onClick={() => handleRejectRequest(request)}
                                                >
                                                    <FiXCircle />
                                                    <span>거절</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* 보낸 친구 요청 섹션 */}
                    {currentView === 'pendingSent' && (
                        <section className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>보낸 친구 요청</h2>
                            <div className={styles.friendList}>
                                {filteredPendingSentRequests.length === 0 ? (
                                    <div className={styles.emptyBox}>
                                        {searchTerm ? `'${searchTerm}'에 해당하는 보낸 요청이 없습니다.` : '보낸 친구 요청이 없습니다.'}
                                    </div>
                                ) : (
                                    filteredPendingSentRequests.map(request => (
                                        <div key={request.friendshipId} className={styles.friendItem}>
                                            <div className={styles.friendInfo}>
                                                <div className={styles.friendImage} />
                                                <span className={styles.friendNickname}>{request.nickname}</span>
                                            </div>
                                            <div className={styles.friendActions}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                                    onClick={() => handleCancelRequest(request)}
                                                >
                                                    <FiXCircle />
                                                    <span>취소</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* 추천 친구 섹션 (항상 표시) */}
                    <section className={styles.sectionCard}>
                        <h2 className={styles.sectionTitle}>
                            추천 친구
                            <button
                                className={`${styles.actionButton} ${styles.refreshButton}`}
                                onClick={() => handleRefreshRecommendedFriends()} // 함수 호출 방식으로 변경
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
                                                onClick={() => handleAddFriend(recFriend)}
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
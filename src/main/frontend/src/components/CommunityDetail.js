import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/CommunityDetail.module.css';

function timeAgoFromDate(dateString) {
    if (!dateString) return '등록 시간 정보 없음';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
}

function CommunityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const token = localStorage.getItem('accessToken'); // 토큰 키 이름 맞춤

    useEffect(() => {
        if (!id) return;

        console.log("현재 accessToken:", token);

        // 게시글 상세 + 좋아요 여부 포함
        axios.get(`http://localhost:8080/api/community/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                const data = res.data;
                setPost(data);
                setLikesCount(data.likes || 0);
                setLiked(data.liked || false);
            })
            .catch(err => console.error('게시글 불러오기 실패:', err));

        // 댓글 불러오기
        axios.get(`http://localhost:8080/api/community/${id}/comments`)
            .then(res => setComments(res.data))
            .catch(err => console.error('댓글 불러오기 실패:', err));
    }, [id, token]);

    const handleLikeToggle = () => {
        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        axios.post(`http://localhost:8080/api/community/${id}/like`, null, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setLiked(res.data); // 서버가 true/false 반환
                setLikesCount(prev => res.data ? prev + 1 : prev - 1);
            })
            .catch(err => {
                console.error('좋아요 상태 업데이트 실패:', err);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            });
    };

    const handleAddComment = () => {
        if (newComment.trim() === '') return; // 빈 댓글 방지

        const commentData = { content: newComment };

        axios.post(`http://localhost:8080/api/community/${id}/comments`, commentData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                setComments(prev => [...prev, res.data]); // 새 댓글 추가
                setNewComment(''); // 입력란 초기화
            })
            .catch(err => console.error('댓글 추가 실패:', err));
    };

    if (!post) return <div className={styles.loading}>게시글을 불러오는 중...</div>;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                🏠 목록으로
            </button>

            <h1 className={styles.title}>{post.title}</h1>

            {post.imagePath && (
                <img
                    src={`http://localhost:8080${post.imagePath}`}
                    alt={`${post.title} 이미지`}
                    className={styles.postImage}
                />
            )}

            <div className={styles.meta}>
                {timeAgoFromDate(post.createdAt)} · 익명
            </div>

            <p className={styles.content}>{post.content}</p>

            <div className={styles.likeSection}>
                <button
                    className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
                    onClick={handleLikeToggle}
                >
                    {liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
                </button>
                <span className={styles.likesCount}>{likesCount}명</span>
            </div>

            <div className={styles.commentsSection}>
                <h2>댓글</h2>
                <div className={styles.commentInputBox}>
                    <textarea
                        className={styles.commentInput}
                        placeholder="댓글을 입력하세요."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button className={styles.commentButton} onClick={handleAddComment}>
                        등록
                    </button>
                </div>

                {comments.length > 0 ? (
                    <ul className={styles.commentList}>
                        {comments.map((comment) => (
                            <li key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentContent}>{comment.content}</div>
                                <div className={styles.commentMeta}>
                                    {timeAgoFromDate(comment.createdAt)} · 익명
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>댓글이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default CommunityDetail;

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

    useEffect(() => {
        // 게시글 정보 불러오기
        console.log('받은 id:', id);
        axios.get(`http://localhost:8080/api/community/${id}`)
            .then(res => {
                console.log('게시글 데이터:', res.data);
                setPost(res.data);
                setLikesCount(res.data.likes || 0);
                // TODO: 서버에서 현재 사용자의 좋아요 여부 받아서 setLiked 처리 가능
            })
            .catch(err => console.error('게시글 불러오기 실패:', err));

        // 댓글 불러오기
        axios.get(`http://localhost:8080/api/community/${id}/comments`)
            .then(res => {
                setComments(res.data);
            })
            .catch(err => console.error('댓글 불러오기 실패:', err));
    }, [id]);

    const handleAddComment = () => {
        if (newComment.trim() === '') return;
        const commentData = { content: newComment, postId: id };

        axios.post(`http://localhost:8080/api/community/${id}/comments`, commentData)
            .then(res => {
                setComments(prev => [...prev, res.data]);
                setNewComment('');
            })
            .catch(err => console.error('댓글 추가 실패:', err));
    };

    const handleLikeToggle = () => {
        if (liked) {
            setLikesCount(likesCount - 1);
        } else {
            setLikesCount(likesCount + 1);
        }
        setLiked(!liked);

        // TODO: 서버 좋아요 상태 업데이트 API 호출
        // axios.post(`http://localhost:8080/api/community/${id}/like`, { liked: !liked })
        //     .catch(err => console.error('좋아요 상태 업데이트 실패:', err));
    };

    if (!post) return <div className={styles.loading}>게시글을 불러오는 중...</div>;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>🏠 목록으로</button>

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
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button className={styles.commentButton} onClick={handleAddComment}>등록</button>
                </div>

                {comments.length > 0 ? (
                    <ul className={styles.commentList}>
                        {comments.map(comment => (
                            <li key={comment.id} className={styles.commentItem}>
                                <div className={styles.commentContent}>{comment.content}</div>
                                <div className={styles.commentMeta}>{timeAgoFromDate(comment.createdAt)} · 익명</div>
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

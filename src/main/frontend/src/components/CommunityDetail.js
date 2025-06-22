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
    const [showEditMenu, setShowEditMenu] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const token = localStorage.getItem('ACCESS_TOKEN');
    const currentUserId = localStorage.getItem('USER_ID');

    useEffect(() => {
        if (!id) return;

        axios
            .get(`http://localhost:8080/api/community/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            .then((res) => {
                const data = res.data;
                setPost(data);
                setLikesCount(data.likes || 0);
                setLiked(data.liked || false);
            })
            .catch((err) => console.error('게시글 불러오기 실패:', err));

        axios
            .get(`http://localhost:8080/api/community/${id}/comments`)
            .then((res) => setComments(res.data))
            .catch((err) => console.error('댓글 불러오기 실패:', err));
    }, [id, token]);

    const handleLikeToggle = () => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios
            .post(`http://localhost:8080/api/community/${id}/like`, null, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setLiked(res.data);
                setLikesCount((prev) => (res.data ? prev + 1 : prev - 1));
            })
            .catch((err) => {
                console.error('좋아요 상태 업데이트 실패:', err);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            });
    };

    const handleAddComment = () => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (newComment.trim() === '') return;

        const commentData = { content: newComment };

        axios
            .post(`http://localhost:8080/api/community/${id}/comments`, commentData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setComments((prev) => [...prev, res.data]);
                setNewComment('');
            })
            .catch((err) => {
                console.error('댓글 추가 실패:', err);
                alert('댓글 등록 중 오류가 발생했습니다.');
            });
    };

    const handleDeleteComment = (commentId) => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        axios
            .delete(`http://localhost:8080/api/community/${id}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
                if (editingCommentId === commentId) {
                    setEditingCommentId(null);
                    setShowEditMenu(null);
                }
            })
            .catch((err) => {
                console.error('댓글 삭제 실패:', err);
                alert('댓글 삭제 중 오류가 발생했습니다.');
            });
    };

    const handleUpdateComment = (commentId, updatedContent) => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios
            .put(
                `http://localhost:8080/api/community/${id}/comments/${commentId}`,
                { content: updatedContent },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? res.data : c))
                );
                setEditingCommentId(null);
                setShowEditMenu(null);
                setEditContent('');
            })
            .catch((err) => {
                console.error('댓글 수정 실패:', err);
                alert('댓글 수정 중 오류가 발생했습니다.');
            });
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
                        {comments.map((comment) => {
                            const isCommentAuthor = comment.authorId === currentUserId;
                            const isPostOwner = post.authorId === currentUserId;
                            const showDeleteButton = isPostOwner || isCommentAuthor;
                            const isEditing = editingCommentId === comment.id;

                            return (
                                <li key={comment.id} className={styles.commentItem} style={{ position: 'relative' }}>
                                    {isCommentAuthor && !isEditing && (
                                        <button
                                            onClick={() =>
                                                setShowEditMenu(showEditMenu === comment.id ? null : comment.id)
                                            }
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                background: 'transparent',
                                                border: 'none',
                                                fontSize: '20px',
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            }}
                                            aria-label="댓글 메뉴 열기"
                                        >
                                            ⋮
                                        </button>
                                    )}

                                    {showEditMenu === comment.id && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 25,
                                                right: 8,
                                                background: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: 4,
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                                zIndex: 10,
                                                display: 'inline-flex',
                                                flexDirection: 'column',
                                                padding: '2px 0',
                                                minWidth: 'auto'
                                            }}
                                        >
                                            {comment.authorId === currentUserId && (
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditContent(comment.content);
                                                        setShowEditMenu(null);
                                                    }}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        padding: '2px 6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        textAlign: 'left',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setShowEditMenu(null);
                                                    handleDeleteComment(comment.id);
                                                }}
                                                style={{
                                                    border: 'none',
                                                    background: 'none',
                                                    padding: '2px 6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    color: 'red',
                                                    textAlign: 'left',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}

                                    {isEditing ? (
                                        <>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                autoFocus
                                                className={styles.commentInput}
                                                style={{ width: '100%', marginTop: '20px' }}
                                            />
                                            <div style={{ marginTop: 6 }}>
                                                <button
                                                    onClick={() => {
                                                        if (editContent.trim()) {
                                                            handleUpdateComment(comment.id, editContent);
                                                        } else {
                                                            alert('댓글 내용을 입력해주세요.');
                                                        }
                                                    }}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    수정 완료
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(null);
                                                        setShowEditMenu(null);
                                                        setEditContent(comment.content);
                                                    }}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.commentContent} style={{ marginTop: '20px' }}>
                                                {comment.content}
                                            </div>
                                            <div className={styles.commentMeta}>
                                                {timeAgoFromDate(comment.createdAt)} · 익명
                                            </div>
                                        </>
                                    )}

                                    {isPostOwner && !isCommentAuthor && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            style={{
                                                color: 'red',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                            }}
                                            aria-label="댓글 삭제"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>댓글이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default CommunityDetail;

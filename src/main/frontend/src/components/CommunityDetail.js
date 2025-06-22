import React, { useEffect, useState, useRef } from 'react';
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

    // 수정 상태
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editTags, setEditTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const token = localStorage.getItem('ACCESS_TOKEN');
    const currentUserId = localStorage.getItem('USER_ID');
    console.log('ACCESS_TOKEN:', token);

    // 댓글 관련 ref (textarea 자동 크기 조절 가능)
    const commentInputRef = useRef(null);

    useEffect(() => {
        if (!id) return;

        // 게시글 가져오기
        axios
            .get(`http://localhost:8080/api/community/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            .then((res) => {
                const data = res.data;
                setPost(data);
                setLikesCount(data.likes || 0);
                setLiked(data.liked || false);

                // 수정용 초기화
                setEditTitle(data.title);
                setEditContent(data.content);
                setEditTags(data.tags ? JSON.parse(data.tags) : []);
                setEditImagePreview(data.imagePath ? `http://localhost:8080${data.imagePath}` : null);
                setEditImageFile(null);
            })
            .catch((err) => console.error('게시글 불러오기 실패:', err));

        // 댓글 가져오기
        axios
            .get(`http://localhost:8080/api/community/${id}/comments`)
            .then((res) => setComments(res.data))
            .catch((err) => console.error('댓글 불러오기 실패:', err));
    }, [id, token]);

    // 좋아요 토글
    const handleLikeToggle = () => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios
            .post(
                `http://localhost:8080/api/community/${id}/like`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                setLiked(res.data);
                setLikesCount((prev) => (res.data ? prev + 1 : prev - 1));
            })
            .catch((err) => {
                console.error('좋아요 실패:', err);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            });
    };

    // 게시글 수정 제출
    const handleUpdatePost = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('content', editContent);
            formData.append('tags', JSON.stringify(editTags));
            if (editImageFile) formData.append('image', editImageFile);

            const res = await axios.put(
                `http://localhost:8080/api/community/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPost(res.data);
            setIsEditingPost(false);
            alert('게시글이 수정되었습니다!');
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            alert('게시글 수정 중 오류가 발생했습니다.');
        }
    };

    // 게시글 삭제
    const handleDeletePost = () => {
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        axios
            .delete(`http://localhost:8080/api/community/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                alert('게시글이 삭제되었습니다.');
                navigate(-1);
            })
            .catch((err) => {
                console.error('게시글 삭제 실패:', err);
                alert('게시글 삭제 중 오류가 발생했습니다.');
            });
    };

    // 댓글 추가
    const handleAddComment = () => {
        if (!newComment.trim()) return;
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        axios
            .post(
                `http://localhost:8080/api/community/${id}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                setComments((prev) => [...prev, res.data]);
                setNewComment('');
            })
            .catch((err) => {
                console.error('댓글 추가 실패:', err);
                alert('댓글 등록 중 오류가 발생했습니다.');
            });
    };

    // 댓글 수정
    const handleUpdateComment = (commentId) => {
        if (!editCommentContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        axios
            .put(
                `http://localhost:8080/api/community/${id}/comments/${commentId}`,
                { content: editCommentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? res.data : c))
                );
                setEditingCommentId(null);
                setEditCommentContent('');
            })
            .catch((err) => {
                console.error('댓글 수정 실패:', err);
                alert('댓글 수정 중 오류가 발생했습니다.');
            });
    };

    // 댓글 삭제
    const handleDeleteComment = (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        axios
            .delete(`http://localhost:8080/api/community/${id}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            })
            .catch((err) => {
                console.error('댓글 삭제 실패:', err);
                alert('댓글 삭제 중 오류가 발생했습니다.');
            });
    };

    // 태그 입력 핸들러 (쉼표, 스페이스, 엔터로 구분)
    const handleTagInputChange = (e) => setTagInput(e.target.value);

    const handleTagInputKeyDown = (e) => {
        if (['Enter', ' ', ','].includes(e.key)) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !editTags.includes(newTag)) {
                setEditTags([...editTags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setEditTags(editTags.filter((t) => t !== tag));
    };

    // 이미지 파일 변경 핸들러 + 미리보기
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setEditImageFile(null);
            setEditImagePreview(null);
            return;
        }

        setEditImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const isPostOwner = post?.authorId === currentUserId;

    if (!post) return <div className={styles.loading}>게시글을 불러오는 중...</div>;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                ← 목록
            </button>

            {isPostOwner && !isEditingPost && (
                <div className={styles.ownerButtons}>
                    <button onClick={() => setIsEditingPost(true)}>수정</button>
                    <button onClick={handleDeletePost}>삭제</button>
                </div>
            )}

            {isEditingPost ? (
                <>
                    <input
                        className={styles.input}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        autoFocus
                    />

                    <textarea
                        className={`${styles.textarea} ${styles.editTextarea}`}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                    />

                    {/* 해시태그 편집 */}
                    <div className={styles.tagsEditor}>
                        <label>해시태그</label>
                        <div className={styles.tagInputWrapper}>
                            <input
                                type="text"
                                placeholder="해시태그 입력 후 Enter, 쉼표, 스페이스"
                                value={tagInput}
                                onChange={handleTagInputChange}
                                onKeyDown={handleTagInputKeyDown}
                                className={styles.tagInput}
                            />
                            <div className={styles.tagList}>
                                {editTags.map((tag) => (
                                    <span key={tag} className={styles.tag}>
                    #{tag}
                                        <button
                                            type="button"
                                            className={styles.removeTagBtn}
                                            onClick={() => removeTag(tag)}
                                        >
                      ×
                    </button>
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 이미지 업로드 및 미리보기 */}
                    <div className={styles.imageEditor}>
                        <label htmlFor="imageUpload" className={styles.imageUploadLabel}>
                            {editImagePreview ? (
                                <img
                                    src={editImagePreview}
                                    alt="이미지 미리보기"
                                    className={styles.imagePreview}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>이미지 업로드</div>
                            )}
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.imageInput}
                        />
                    </div>

                    <div className={styles.ownerButtons} style={{ marginTop: 16 }}>
                        <button onClick={handleUpdatePost} className={styles.submitBtn}>
                            수정
                        </button>
                        <button onClick={() => setIsEditingPost(false)} className={styles.cancelBtn}>
                            취소
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h1 className={styles.title}>{post.title}</h1>

                    {post.imagePath && (
                        <img
                            src={`http://localhost:8080${post.imagePath}`}
                            alt="게시글 이미지"
                            className={styles.postImage}
                        />
                    )}

                    <div className={styles.meta}>
                        {timeAgoFromDate(post.createdAt)} · 익명
                    </div>

                    <p className={styles.content}>{post.content}</p>

                    <div className={styles.tagsContainer}>
                        {post.tags &&
                            JSON.parse(post.tags).map((tag) => (
                                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
                            ))}
                    </div>

                    <div className={styles.likeSection}>
                        <button
                            className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
                            onClick={handleLikeToggle}
                        >
                            {liked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
                        </button>
                        <span className={styles.likesCount}>{likesCount}명</span>
                    </div>

                    {/* 댓글 섹션 */}
                    <div className={styles.commentsSection}>
                        <h2>댓글</h2>
                        <div className={styles.commentInputBox}>
              <textarea
                  ref={commentInputRef}
                  className={styles.commentInput}
                  placeholder="댓글을 입력하세요."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
              />
                            <button className={styles.commentButton} onClick={handleAddComment}>
                                등록
                            </button>
                        </div>

                        <ul className={styles.commentList}>
                            {comments.map((comment) => {
                                const isCommentAuthor = comment.authorId === currentUserId;
                                return (
                                    <li key={comment.id} className={styles.commentItem}>
                                        {editingCommentId === comment.id ? (
                                            <>
                        <textarea
                            className={styles.commentInput}
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            autoFocus
                        />
                                                <div style={{ marginTop: 6 }}>
                                                    <button
                                                        onClick={() => handleUpdateComment(comment.id)}
                                                        className={styles.submitBtn}
                                                    >
                                                        수정 완료
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className={styles.cancelBtn}
                                                    >
                                                        취소
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className={styles.commentContent}>{comment.content}</div>
                                                <div className={styles.commentMeta}>
                                                    {timeAgoFromDate(comment.createdAt)} · 익명
                                                </div>
                                                {(isCommentAuthor || isPostOwner) && (
                                                    <div className={styles.commentButtons}>
                                                        {isCommentAuthor && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCommentId(comment.id);
                                                                    setEditCommentContent(comment.content);
                                                                }}
                                                            >
                                                                수정
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDeleteComment(comment.id)}>
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

export default CommunityDetail;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/CommunityWrite.module.css';

function CommunityWrite() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        const token = localStorage.getItem('ACCESS_TOKEN');
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('tags', JSON.stringify(tags));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.post('http://localhost:8080/api/community', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            alert('게시글이 등록되었습니다!');
            navigate('/community');
        } catch (error) {
            console.error(error);
            alert('게시글 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>게시글 작성</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <label className={styles.label}>
                    제목
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                        placeholder="제목을 입력하세요"
                    />
                </label>

                <label className={styles.label}>
                    내용
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textarea}
                        placeholder="내용을 입력하세요"
                        rows={8}
                        style={{ resize: 'none', overflowY: 'auto' }}
                    />
                </label>

                <label className={styles.label}>
                    해시태그
                    <input
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagInputKeyDown}
                        className={styles.input}
                        placeholder="해시태그 입력 후 Enter, 쉼표(,) 또는 스페이스바로 구분"
                    />
                    <div className={styles.tagList}>
                        {tags.map((tag) => (
                            <div key={tag} className={styles.tagItem}>
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className={styles.removeTagButton}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </label>

                <label className={styles.label}>
                    사진 첨부
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.fileInput}
                    />
                    {imagePreview && (
                        <div className={styles.imagePreviewWrapper}>
                            <img src={imagePreview} alt="미리보기" className={styles.imagePreview} />
                            <button
                                type="button"
                                onClick={() => {
                                    setImageFile(null);
                                    setImagePreview(null);
                                }}
                                className={styles.removeImageButton}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </label>

                <div className={styles.buttonRow}>
                    <button type="submit" className={styles.submitButton}>등록</button>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => navigate('/community')}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CommunityWrite;

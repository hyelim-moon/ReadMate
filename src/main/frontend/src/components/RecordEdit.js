import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Record.module.css';

function RecordEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        author: '',
        publisher: '',
        genre: '',
        content: '',
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [deletePhoto, setDeletePhoto] = useState(false);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/records/${id}`);
                if (!res.ok) throw new Error('데이터를 불러오는 데 실패했습니다.');
                const data = await res.json();
                setForm({
                    title: data.title || '',
                    author: data.author || '',
                    publisher: data.publisher || '',
                    genre: data.genre || '',
                    content: data.content || '',
                });
                if (data.photo) setPreview(`http://localhost:8080${data.photo}`);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRecord();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setDeletePhoto(false); // 새 이미지 선택 시 삭제 플래그 해제
        }
    };

    const handleDeletePhotoToggle = () => {
        setDeletePhoto(prev => !prev);
        if (!deletePhoto) {
            setImage(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.title.trim() || !form.author.trim()) {
            setError('책 제목과 저자는 필수 입력 항목입니다.');
            return;
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('author', form.author);
        formData.append('publisher', form.publisher);
        formData.append('genre', form.genre);
        formData.append('content', form.content);
        if (image) formData.append('photo', image);
        formData.append('removePhoto', deletePhoto);  // **서버쪽 변수명에 맞춰서 removePhoto로 보냄**

        try {
            const res = await fetch(`http://localhost:8080/api/records/${id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!res.ok) throw new Error('수정 실패');
            alert('수정되었습니다.');
            navigate(`/record/${id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!form.title && !error) return <p>불러오는 중...</p>;

    return (
        <main className={styles.page}>
            <h2 className={styles.heading}>독서 기록 수정</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>책 제목 <span>*</span></label>
                        <input name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>저자 <span>*</span></label>
                        <input name="author" value={form.author} onChange={handleChange} required />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>출판사</label>
                        <input name="publisher" value={form.publisher} onChange={handleChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>장르</label>
                        <input name="genre" value={form.genre} onChange={handleChange} />
                    </div>
                </div>

                <div className={styles.reviewBox}>
                    <label>감상문</label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={6}
                        maxLength={1000}
                    />
                </div>

                <div className={styles.imageBox}>
                    <button
                        type="button"
                        className={styles.imageButton}
                        onClick={() => document.getElementById('imageInput').click()}
                    >
                        사진 첨부
                    </button>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        style={{ display: 'none' }}
                    />
                    {preview && (
                        <>
                            <img src={preview} alt="미리보기" className={styles.preview} />
                            <button
                                type="button"
                                className={styles.deleteImageBtn}
                                onClick={handleDeletePhotoToggle}
                                style={{ marginLeft: '10px' }}
                            >
                                이미지 삭제
                            </button>
                        </>
                    )}
                </div>

                <button type="submit" className={styles.submitBtn}>수정하기</button>
            </form>
        </main>
    );
}

export default RecordEdit;

import { useState } from 'react';
import styles from '../assets/styles/Record.module.css';
import Popup from './RecordSavePopup';

function Record() {
    const [form, setForm] = useState({
        title: '',
        author: '',
        publisher: '',
        genre: '',
        review: '',
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false); // 팝업 상태 관리
    const [popupMessage, setPopupMessage] = useState(''); // 팝업 메시지

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'review') {
            setCharCount(value.length);
        }
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, author, review, publisher, genre } = form;

        if (!title.trim() || !author.trim()) {
            setError('책 제목과 저자는 필수 입력 항목입니다.');
            return;
        }
        if (review.length > 1000) {
            setError('감상문은 1000자 이내로 작성해주세요.');
            return;
        }

        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('publisher', publisher);
        formData.append('genre', genre);
        formData.append('review', review);
        formData.append('photo', image);  // 이미지 추가

        try {
            const response = await fetch('http://localhost:8080/api/records', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setPopupMessage('저장되었습니다.');
                setShowPopup(true);  // 팝업 표시
                // 폼 초기화
                setForm({
                    title: '',
                    author: '',
                    publisher: '',
                    genre: '',
                    review: '',
                });
                setImage(null);
                setPreview(null);
                setCharCount(0);
            } else {
                setError('저장에 실패했습니다.');
            }
        } catch (error) {
            setError('서버 오류가 발생했습니다.');
        }
    };

    const closePopup = () => {
        setShowPopup(false);  // 팝업 닫기
    };

    return (
        <main className={styles.page}>
            <h2 className={styles.heading}>독서 기록 작성</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>책 제목 <span>*</span></label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>저자 <span>*</span></label>
                        <input
                            name="author"
                            value={form.author}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>출판사</label>
                        <input
                            name="publisher"
                            value={form.publisher}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>장르</label>
                        <input
                            name="genre"
                            value={form.genre}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className={styles.reviewImageRow}>
                    <div className={styles.reviewBox}>
                        <label className={styles.inputGroupLabel}>감상문</label>
                        <textarea
                            name="review"
                            className={styles.textarea}
                            value={form.review}
                            onChange={handleChange}
                            maxLength={1000}
                            rows={6}
                        />
                        <div className={styles.charCount}>
                            {charCount} / 1000 자
                        </div>
                    </div>
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
                    {preview && <img src={preview} alt="preview" className={styles.preview} />}
                </div>

                <button type="submit" className={styles.submitBtn}>저장하기</button>
            </form>

            {/* 팝업이 활성화되면 표시 */}
            {showPopup && <Popup message={popupMessage} onClose={closePopup} />}
        </main>
    );
}

export default Record;
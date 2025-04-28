import { useState } from 'react';
import styles from '../assets/styles/Record.module.css';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { title, author, review } = form;

        if (!title.trim() || !author.trim()) {
            setError('책 제목과 저자는 필수 입력 항목입니다.');
            return;
        }
        if (review.length > 1000) {
            setError('감상문은 1000자 이내로 작성해주세요.');
            return;
        }

        setError('');
        console.log('✅ 제출된 데이터:', { ...form, image });

        // 초기화
        setForm({
            title: '',
            author: '',
            publisher: '',
            genre: '',
            review: '',
        });
        setImage(null);
        setPreview(null);
    };

    return (
        <main className={styles.page}>
            <h2 className={styles.heading}>독서 기록 작성</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <p className={styles.error}>{error}</p>}

                {/* 책 제목 + 저자 */}
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label>책 제목 *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>저자 *</label>
                        <input
                            name="author"
                            value={form.author}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* 출판사 + 장르 */}
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

                <label>감상문 (1000자 이내)</label>
                <textarea
                    name="review"
                    value={form.review}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={6}
                />

                <label>사진 첨부</label>
                <input type="file" accept="image/*" onChange={handleImage} />
                {preview && <img src={preview} alt="preview" className={styles.preview} />}

                <button type="submit" className={styles.submitBtn}>저장하기</button>
            </form>
        </main>
    );
}

export default Record;

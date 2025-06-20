import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/MyBook.module.css'; // 스타일 파일 새로 만들어야 함

// 별점 컴포넌트 (1~5개 별 표시)
function StarRating({ score }) {
  const fullStars = Math.floor(score);
  const emptyStars = 5 - fullStars;
  return (
    <div className={styles.starRating} aria-label={`독서 만족도 ${score}점`}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={styles.star}>&#9733;</span>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.starEmpty}>&#9733;</span>
      ))}
      <span className={styles.scoreText}>({score}점)</span>
    </div>
  );
}

function HeartRating({ score }) {
  const fullHearts = Math.floor(score);
  const emptyHearts = 5 - fullHearts;
  return (
    <div className={styles.heartRating} aria-label={`읽고 싶은 정도 ${score}점`}>
      {[...Array(fullHearts)].map((_, i) => (
        <span key={`full-${i}`} className={styles.heart}>&#10084;</span>
      ))}
      {[...Array(emptyHearts)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.heartEmpty}>&#10084;</span>
      ))}
      <span className={styles.scoreText}>({score}점)</span>
    </div>
  );
}

function MyBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);

  useEffect(() => {
    // 예시 더미 데이터에 별점(score)과 읽고 싶은 정도(wishScore) 추가
    const dummyBooks = [
      {
        id: 1,
        title: '모모',
        author: '미하엘 엔데',
        publisher: '비룡소',
        genre: '판타지',
        content: '시간을 도둑맞은 사람들에게 시간을 되돌려주는 소녀의 이야기.',
        photo: '/momo.jpg',
        startedAt: '2024-11-01',
        finishedAt: '2024-11-20',
        progress: 100,
        pageCount: 250,
        score: 5,        // 별점 1~5 (읽은 책만)
        wishScore: 0,    // 읽고 싶은 책용 점수 (읽은 책은 0)
      },
      {
          id: 2,
          title: '어린 왕자',
          author: '생텍쥐페리',
          publisher: '열린책들',
          genre: '우화',
          content: '어른이 되어버린 이들을 위한 순수한 마음의 이야기.',
          photo: '/little_prince.jpg',
          startedAt: '2025-01-15',
          finishedAt: null,
          progress: 40,
          savedAt: '2025-05-10',
          pageCount: 120,
      },
      {
          id: 3,
          title: '데미안',
          author: '헤르만 헤세',
          publisher: '민음사',
          genre: '소설',
          content: '자아를 찾아가는 청년의 성장 이야기.',
          photo: '/demian.jpg',
          startedAt: '2025-04-01',
          finishedAt: null,
          progress: 70,
          savedAt: '2025-06-10',
          pageCount: 180,
      },
      {
          id: 4,
          title: '해리포터와 마법사의 돌',
          author: 'J.K. 롤링',
          publisher: '문학수첩',
          genre: '판타지',
          content: '마법사 학교에서 펼쳐지는 신비한 모험.',
          photo: '/harry_potter1.jpg',
          startedAt: '2025-03-05',
          finishedAt: '2025-04-20',
          progress: 100,
          savedAt: '2025-05-25',
          pageCount: 320,
          score: 3,
      },
      {
          id: 5,
          title: '폭풍의 언덕',
          author: '에밀리 브론테',
          publisher: '문학동네',
          genre: '고전 소설',
          content: '요크셔의 황량한 고원에서 펼쳐지는 히스클리프와 캐서린의 격렬하고 비극적인 사랑과 복수 이야기.',
          photo: '/wuthering_heights.jpg',
          startedAt: '2025-05-01',
          finishedAt: '2025-05-30',
          progress: 100,
          savedAt: '2025-06-18',
          pageCount: 400,
          score: 5,
      },
      {
        id: 6,
        title: '제인 에어',
        author: '샬롯 브론테',
        publisher: '문학동네',
        genre: '고전 소설',
        content: '어려운 유년 시절을 극복하고 자신만의 삶과 사랑을 찾아가는 강인한 여성 제인 에어의 이야기.',
        photo: '/jane_eyre.jpg',
        startedAt: null,
        finishedAt: null,
        progress: 0,
        pageCount: 500,
        score: 0,
        wishScore: 4,   // 읽고 싶은 정도 4점 (하트 4개)
      },
    ];

    const foundBook = dummyBooks.find((b) => b.id === Number(id));
    if (!foundBook) {
      alert('책 정보를 찾을 수 없습니다.');
      navigate('/my-library');
    } else {
      setBook(foundBook);
    }
  }, [id, navigate]);

  const getReadingStatus = () => {
    if (book.progress === 100) return '읽은 책';
    if (book.progress > 0) return '읽고 있는 책';
    return '읽고 싶은 책';
  };

  const getReadingDays = () => {
    if (!book.startedAt) return '-';
    const start = new Date(book.startedAt);
    const end = book.finishedAt ? new Date(book.finishedAt) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };


  const handleEdit = () => {
    navigate(`/edit-book/${book.id}`);
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 책을 삭제하시겠습니까?')) {
      // 실제 앱이라면 API 호출 또는 상태 업데이트 필요
      alert('책이 삭제되었습니다.');
      navigate('/my-library');
    }
  };


  if (!book) return <p>로딩 중...</p>;

  return (
    <main className={styles.myBookPage}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>← 뒤로가기</button>

      <div className={styles.bookHeader}>
        <div className={styles.bookImageWrapper}>
          {book.photo && (
            <img src={book.photo} alt={`${book.title} 책 이미지`} className={styles.bookImage} />
          )}
        </div>

        <div className={styles.bookInfoArea}>
          <div className={styles.headerTop}>
            <div className={styles.titleRow}>
              <h1 className={styles.bookTitle}>{book.title}</h1>
              <div className={styles.ratingArea}>
                {book.progress === 0 ? (
                  <HeartRating score={book.wishScore || 0} />
                ) : (
                  <StarRating score={book.score || 0} />
                )}
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.editButton} onClick={handleEdit}>수정</button>
              <button className={styles.deleteButton} onClick={handleDelete}>삭제</button>
            </div>
          </div>

          <p><strong>저자:</strong> {book.author}</p>
          <p><strong>출판사:</strong> {book.publisher}</p>
          <p><strong>장르:</strong> {book.genre}</p>
          <p className={styles.readingStatus}>{getReadingStatus()}</p>
        </div>
      </div>


      <section className={styles.readingPeriod}>
        <h2>독서 기간</h2>
        <p>{formatDate(book.startedAt)} ~ {book.finishedAt ? formatDate(book.finishedAt) : '읽는 중'}</p>
        <p className={styles.readingDaysBox}>
          총 <span className={styles.squareNumber}>{getReadingDays()}</span>일 동안 읽었습니다
        </p>
      </section>

      <section className={styles.readingProgress}>
        <h2>독서량</h2>
        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${book.progress}%` }}
            />
          </div>
          <div className={styles.progressPercent}>{book.progress}%</div>
        </div>
        <p>{Math.round(book.pageCount * (book.progress / 100))} / {book.pageCount} 페이지 읽음</p>
      </section>

      <section className={styles.bookContent}>
        <h2>책 소개</h2>
        <p>{book.content}</p>
      </section>
    </main>
  );
}

export default MyBook;

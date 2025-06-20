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
  console.log("Book ID:", id);
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
      const token = localStorage.getItem('ACCESS_TOKEN');
      const userId = localStorage.getItem('USER_ID');
      console.log("UserID from LocalStorage:", userId);
      console.log("Token from LocalStorage:", token);

      const fetchBookData = async () => {
          setLoading(true);
          try {
              if (!userId) {
                  alert('로그인이 필요합니다!');
                  navigate('/login');
                  return;
              }

              const response = await fetch(`http://localhost:8080/api/saved-books/by-user/${userId}`, {
                  method: 'GET',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                  },
              });

              if (!response.ok) {
                  throw new Error(`서버 오류: ${response.status}`);
              }

              const data = await response.json();
              console.log("Fetched Data:", data);

              // 여기에 디버깅을 추가해서 실제로 데이터가 어떻게 반환되는지 확인
              const bookIdFromURL = Number(id); // URL에서 받아온 id 값은 문자열일 수 있으므로 숫자로 변환
              console.log("ID from URL (converted to number):", bookIdFromURL);
              console.log("Book IDs from Data:", data.map(book => book.id));  // 데이터에서 모든 책의 id를 출력

              const selectedBook = data.find(book => book.id === bookIdFromURL);
              console.log('Selected Book:', selectedBook);  // 책을 제대로 찾았는지 출력

              if (selectedBook) {
                  setBook(selectedBook);
              } else {
                  alert('책을 찾을 수 없습니다.');
                  navigate('/mylibrary');
              }
          } catch (error) {
              console.error('책 정보를 불러오는 중 오류 발생:', error);
              alert(`책 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
              navigate('/mylibrary');
          } finally {
              setLoading(false);
          }
      };

      fetchBookData();
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
      alert('책이 삭제되었습니다.');
      navigate('/mylibrary');
    }
  };

  if (loading) return <p>로딩 중...</p>;

  if (!book) return <p>책 정보를 불러오는 데 실패했습니다.</p>;

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

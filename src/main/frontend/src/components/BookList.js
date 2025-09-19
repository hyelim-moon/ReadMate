import React, { useState } from 'react';
import styles from "../assets/styles/TodaysRecord.module.css";

const todayBook = {
  title: '작은 아씨들',
  author: '루이자 메이 올콧',
  coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
  description: '가족과 사랑, 성장에 대한 따뜻한 이야기입니다.',
  link: 'https://www.goodreads.com/book/show/1934.Little_Women',
  sentences: [
    '행복은 늘 우리 가까이에 있다.',
    '용기는 두려움을 극복하는 힘이다.'
  ],
  quiz: [
      {
        question: '작은 아씨들에서 네 자매 중 맏이의 이름은 무엇일까요?',
        options: ['메그', '조', '베스', '에이미'],
        answer: '메그'
      },
      {
        question: '책의 작가는 누구일까요?',
        options: ['루이자 메이 올콧', '제인 오스틴', '찰스 디킨스', '마크 트웨인'],
        answer: '루이자 메이 올콧'
      },
      {
        question: '작은 아씨들에서 조가 쓰는 필명은 무엇일까요?',
        options: ['루크', '조 바스', '루크 올콧', '존 마치'],
        answer: '루크 올콧'
      }
  ]
};

function BookList() {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

    const handleAnswer = (option, index) => {
        setQuizAnswers(prev => ({ ...prev, [index]: option }));
    };

  const toggleShowAnswers = () => {
    setShowAnswers(prev => !prev);
  };

  const goNext = () => {
    if (currentQuizIndex < todayBook.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setShowAnswers(false);
    }
  };

  const goPrev = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setShowAnswers(false);
    }
  };

  const quiz = todayBook.quiz[currentQuizIndex];
  const selectedAnswer = quizAnswers[currentQuizIndex];

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.title}>오늘의 책: {todayBook.title}</h2>
        <img src={todayBook.coverUrl} alt={todayBook.title} className={styles.coverImage} />
        <p className={styles.description}>{todayBook.description}</p>
        <a href={todayBook.link} target="_blank" rel="noreferrer" className={styles.link}>
          더 알아보기
        </a>
      </section>

      <section className={styles.section}>
        <h3 className={styles.title}>오늘의 문장</h3>
        {todayBook.sentences.map((sentence, idx) => (
          <blockquote key={idx} className={styles.sentences}>
            “{sentence}”
          </blockquote>
        ))}
        <p className={styles.citation}>– {todayBook.title} ({todayBook.author})</p>
      </section>

      <section>
          <h3 className={styles.title}>오늘의 퀴즈</h3>

          <div className={styles.quizSliderWrapper}>
            <div
              className={styles.quizSlide}
              style={{
                width: `${todayBook.quiz.length * 100}%`, // 문제 개수만큼 넓이 늘리기
                transform: `translateX(-${(currentQuizIndex * 100) / todayBook.quiz.length}%)`, // 현재 인덱스에 따라 이동
              }}
            >
              {todayBook.quiz.map((quizItem, idx) => {
                const selectedAnswer = quizAnswers[idx];
                return (
                  <div key={idx} style={{ width: `${100 / todayBook.quiz.length}%`, paddingRight: 12, boxSizing: 'border-box' }}>
                    <p className={styles.quizQuestion}>{quizItem.question}</p>
                    {quizItem.options.map(option => {
                      const isCorrect = option === quizItem.answer;
                      const isSelected = selectedAnswer === option;
                      return (
                        <label
                          key={option}
                          className={`${styles.optionLabel}
                              ${isSelected ? styles.selected : ''}
                              ${showAnswers && isCorrect ? styles.correct : ''}
                              ${showAnswers && isSelected && !isCorrect ? styles.incorrect : ''}`}
                          style={{
                            color: showAnswers
                              ? isCorrect
                                ? '#0a7a0a'
                                : isSelected
                                ? '#a00'
                                : '#275b3a'
                              : '#275b3a',
                            fontWeight: isSelected ? '700' : '500',
                          }}
                        >
                          <input
                            type="radio"
                            name={`quiz-${idx}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => handleAnswer(option, idx)}
                            disabled={showAnswers}
                            style={{ marginRight: 8 }}
                          />
                          {option}
                          {showAnswers && isCorrect && (
                            <span style={{ marginLeft: 6, color: 'white', fontWeight: '700' }}>✔</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.quizControls}>
            <button
              className={styles.navButton}
              onClick={goPrev}
              disabled={currentQuizIndex === 0}
            >
              이전
            </button>
            <button
              className={styles.navButton}
              onClick={toggleShowAnswers}
            >
              {showAnswers ? '정답 숨기기' : '정답 보기'}
            </button>
            <button
              className={styles.navButton}
              onClick={goNext}
              disabled={currentQuizIndex === todayBook.quiz.length - 1}
            >
              다음
            </button>
          </div>
        </section>
    </div>
  );
}

export default BookList;

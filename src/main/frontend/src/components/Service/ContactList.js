import React from 'react';
import styles from '../../assets/styles/Contact.module.css';

function ContactList({ inquiries, onClickContact, onDeleteContact }) {
  const formatDate = (timestamp) => {
    // timestamp가 유효한 숫자인지 확인
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return null; // 유효하지 않으면 아무것도 반환하지 않음
    }
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.contactContainer}>
      <h2>문의 리스트</h2>

      {(!inquiries || inquiries.length === 0) ? (
        <p className={styles.thankYouMessage}>등록된 문의가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {inquiries.map((item) => {
            const formattedDate = formatDate(item.createdAt);
            return (
              <li
                key={item.id}
                className={styles.inquiryItem}
              >
                <div className={styles.inquiryHeader}>
                  <p><strong>이름:</strong> {item.name}</p>
                  {formattedDate && <p className={styles.inquiryDate}>{formattedDate}</p>}
                </div>
                <p><strong>이메일:</strong> {item.email}</p>
                <p><strong>문의 내용:</strong></p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
                <button
                    className={styles.deleteButton}
                    onClick={() => onDeleteContact(item.id)}
                    type="button"
                    aria-label="문의 삭제"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <button
        className={styles.contactButton}
        onClick={onClickContact}
        type="button"
        aria-label="문의 하기 페이지로 이동"
      >
        문의 하기
      </button>
    </div>
  );
}

export default ContactList;

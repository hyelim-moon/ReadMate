import React from 'react';
import styles from '../../assets/styles/Contact.module.css';

function ContactList({ inquiries, onClickContact }) {
  return (
    <div className={styles.contactContainer}>
      <h2>문의 리스트</h2>

      {(!inquiries || inquiries.length === 0) ? (
        <p className={styles.thankYouMessage}>등록된 문의가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {inquiries.map((item, index) => (
            <li
              key={index}
              className={styles.inquiryItem}
            >
              <p><strong>이름:</strong> {item.name}</p>
              <p><strong>이메일:</strong> {item.email}</p>
              <p><strong>문의 내용:</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
            </li>
          ))}
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

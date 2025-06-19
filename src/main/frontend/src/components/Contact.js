import React, { useState } from 'react';
import styles from '../assets/styles/Contact.module.css';

function Contact({onSubmitInquiry}) {
  const [form, setForm] = useState({
      name: '',
      email: '',
      message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
      setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (onSubmitInquiry) {
        onSubmitInquiry(form);
      }
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    };

   return (
      <div className={styles.contactContainer}>
        <h2>문의하기</h2>
        {submitted ? (
          <p className={styles.thankYouMessage}>
            문의해 주셔서 감사합니다. 빠른 시일 내에 답변 드리겠습니다.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <label>
              이름
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="이름을 입력하세요"
              />
            </label>
            <label>
              이메일
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="이메일을 입력하세요"
              />
            </label>
            <label>
              문의 내용
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="문의 내용을 입력하세요"
                rows={6}
              />
            </label>
            <button type="submit" className={styles.contactButton}>전송하기</button>
          </form>
        )}
      </div>
   );
}

export default Contact;

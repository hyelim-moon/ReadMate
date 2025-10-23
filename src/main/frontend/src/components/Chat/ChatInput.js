import { useState } from 'react';
import styles from '../../assets/styles/ChatInput.module.css';

function ChatInput({ onSend }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.inputArea}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메세지 입력"
                className={styles.inputBox}
            />
            <button type="submit" className={styles.sendButton}>💬</button>
        </form>
    );
}

export default ChatInput;
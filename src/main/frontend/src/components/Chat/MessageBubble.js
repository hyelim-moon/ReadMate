import React from "react";
import ReactMarkdown from 'react-markdown';
import styles from '../../assets/styles/MessageBubble.module.css';
import remarkGfm from "remark-gfm";

function MessageBubble({ text, isUser }) {
    return (
        <div className={isUser ? styles.userMessage : styles.botMessage}>
            <ReactMarkdown
                children={text}
                remarkPlugins={[remarkGfm]}
            />
        </div>
    );
}

export default MessageBubble;
import styles from '../assets/styles/MessageBubble.module.css';

function MessageBubble({ text, isUser }) {
    return (
        <div className={isUser ? styles.userMessage : styles.botMessage}>
            {text}
        </div>
    );
}

export default MessageBubble;
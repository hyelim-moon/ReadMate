import React, { useState } from 'react';
import axios from 'axios';
import styles from '../assets/styles/ChatBot.module.css';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

function ChatBot() {
    const [messages, setMessages] = useState([
        { text: '무엇이 궁금한가요?', sender: 'bot' }
    ]);

    const sendMessage = async (userInput) => {
        setMessages(prev => [...prev, { text: userInput, sender: 'user' }]);

        try {
            const response = await axios.post('http://localhost:8080/api/chat', { message: userInput });
            setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
        } catch (err) {
            setMessages(prev => [...prev, { text: '에러가 발생했어요.', sender: 'bot' }]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} text={msg.text} isUser={msg.sender === 'user'} />
                ))}
            </div>
            <ChatInput onSend={sendMessage} />
        </div>
    );
}

export default ChatBot;
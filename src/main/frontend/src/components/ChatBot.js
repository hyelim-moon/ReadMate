import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/styles/ChatBot.module.css';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

function ChatBot() {
    const [messages, setMessages] = useState([
        { text: '무엇이 궁금한가요?', sender: 'bot' }
    ]);
    const messagesEndRef = useRef(null);

    // ✅ 스크롤 아래로 이동 함수
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ✅ messages가 바뀔 때마다 스크롤 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const sendMessage = async (userInput) => {
        setMessages((prev) => [...prev, { text: userInput, sender: 'user' }]);

        try {
            const res = await axios.post('http://localhost:8080/api/gemini', userInput, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            setMessages((prev) => [
                ...prev,
                { text: res.data, sender: 'bot' }
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { text: '에러가 발생했어요.', sender: 'bot' }
            ]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={idx}
                        text={msg.text}
                        isUser={msg.sender === 'user'}
                    />
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <ChatInput onSend={sendMessage} />
        </div>
    );
}

export default ChatBot;
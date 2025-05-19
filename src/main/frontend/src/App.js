import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from './components/Header';
import Navbar from './components/Navbar';
import MainContent from './components/MainContent';
import RecommendButton from './components/RecommendButton';
import RecordList from './components/RecordList';
import Record from './components/Record';
import ChatBot from './components/ChatBot';
import Community from './components/Community';
import CommunityWrite from "./components/CommunityWrite";
import RecordDetail from './components/RecordDetail';

function App() {
    const [hello, setHello] = useState('');
    const [error, setError] = useState('');
    const [books, setBooks] = useState([]);
    const [bannerText, setBannerText] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [randomBook, setRandomBook] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/test')
            .then((res) => setHello(res.data))
            .catch((err) => setError(err.message));

        axios.get('http://localhost:8080/api/books/recommend')
            .then(res => setBooks(res.data))
            .catch(err => console.error(err));

        axios.get('http://localhost:8080/api/banner')
            .then(res => setBannerText(res.data))
            .catch(err => console.error(err));

        axios.get('http://localhost:8080/api/users/info')
            .then(res => setUserInfo(res.data))
            .catch(err => console.error(err));

        axios.get('http://localhost:8080/api/recommend')
            .then(res => setRandomBook(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <BrowserRouter>
            <div className="App">
                <Header />
                <Navbar />

                <Routes>
                    <Route path="/" element={
                        <>
                            <MainContent/>
                            <hr/>
                            <RecommendButton/>
                            <h2>🔁 백엔드 테스트 응답</h2>
                            <p>{hello}</p>
                            {error && <p style={{color: 'red'}}>Error: {error}</p>}

                            <h2>📢 배너 메시지</h2>
                            <p>{bannerText}</p>

                            <h2>👤 사용자 정보</h2>
                            {userInfo && <p>닉네임: {userInfo.username}</p>}

                            <h2>📚 추천 도서 목록</h2>
                            <ul>
                                {books.map(book => (
                                    <li key={book.id}>
                                        <strong>{book.title}</strong> - {book.author}
                                    </li>
                                ))}
                            </ul>

                            <h2>🎯 랜덤 추천 도서</h2>
                            {randomBook && (
                                <div>
                                    <p><strong>{randomBook.title}</strong> - {randomBook.author}</p>
                                </div>
                            )}
                        </>
                    } />
                    <Route path="/chat" element={<ChatBot />} />
                    <Route path="/recordlist" element={<RecordList />} />
                    <Route path="/record" element={<Record />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/write" element={<CommunityWrite />} />
                    <Route path="/record/:id" element={<RecordDetail />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
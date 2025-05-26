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
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import RecordDetail from './components/RecordDetail';
import RecordEdit from './components/RecordEdit';
import RecordButton from "./components/RecordButton";

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
                            <RecommendButton/>
                        </>
                    } />
                    <Route path="/chat" element={<ChatBot />} />
                    <Route path="/recordlist" element={<RecordList />} />
                    <Route path="/record" element={<Record />} />
                    <Route path="/record/edit/:id" element={<RecordEdit />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/write" element={<CommunityWrite />} />
                    <Route path="/record/:id" element={<RecordDetail />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import CommunityDetail from "./components/CommunityDetail";
import Forgot from "./components/Forgot";
import PointShop from "./components/PointShop";
import ProductDetail from './components/ProductDetail';
import MyPage from "./components/MyPage";

// ─────────────────────────────────────────────────────────────────────────────
// AppContent 컴포넌트를 따로 분리해서, BrowserRouter 안에서 useLocation을 쓸 수 있도록 함
function AppContent() {
    const location = useLocation();

    // 로그인/회원가입/비밀번호 찾기 경로일 때 헤더·네비 숨김
    const hideGlobalHeader = ["/login", "/signup", "/forgot", "/mypage"].includes(location.pathname);

    return (
        <div className="App">
            {/* ① 로그인·회원가입 등 화면에선 보이지 않게 */}
            {!hideGlobalHeader && <Header />}
            {!hideGlobalHeader && <Navbar />}

            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <MainContent />
                            <RecommendButton />
                        </>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot" element={<Forgot />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/mypage" element={<MyPage/>} />
                <Route path="/chat" element={<ChatBot />} />
                <Route path="/recordlist" element={<RecordList />} />
                <Route path="/pointshop" element={<PointShop/>} />
                <Route path="/pointshop/:id" element={<ProductDetail />} />
                <Route path="/record" element={<Record />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/write" element={<CommunityWrite />} />
                <Route path="/community/:id" element={<CommunityDetail />} />
                <Route path="/record/:id" element={<RecordDetail />} />
            </Routes>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
function App() {
    const [hello, setHello] = useState("");
    const [error, setError] = useState("");
    const [books, setBooks] = useState([]);
    const [bannerText, setBannerText] = useState("");
    const [userInfo, setUserInfo] = useState(null);
    const [randomBook, setRandomBook] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8080/api/books/recommend")
            .then((res) => setBooks(res.data))
            .catch((err) => console.error(err));

        axios.get("http://localhost:8080/api/recommend")
            .then((res) => setRandomBook(res.data))
            .catch((err) => console.error(err));
    }, []);

    // BrowserRouter 안에 AppContent를 렌더링
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;

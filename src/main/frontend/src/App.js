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
import MyLibrary from "./components/MyLibrary";
import ProfileEdit from "./components/ProfileEdit";
import PurchaseHistory from "./components/PurchaseHistory";

// ─────────────────────────────────────────────────────────────────────────────
// userId를 props로 받도록 변경
function AppContent({ userid, onLoginSuccess, isLoggedIn }) {
    const location = useLocation();

    // 로그인/회원가입/비밀번호 찾기 경로일 때 헤더·네비 숨김
    const hideGlobalHeader = ["/login", "/signup", "/forgot", "/mypage"].includes(location.pathname);

    return (
        <div className="App">
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
                <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
                <Route path="/forgot" element={<Forgot />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/chat" element={<ChatBot />} />
                <Route path="/recordlist" element={<RecordList />} />
                {/* "/" 경로 중복 문제로 "/pointshop"으로 변경하고 userId 넘김 */}
                <Route path="/pointshop" element={<PointShop userid={userid} />} />
                <Route
                    path="/products/:id"
                    element={<ProductDetail userid={userid} isLoggedIn={isLoggedIn} />}  // userId랑 isLoggedIn 둘 다 넘김
                />
                <Route path="/record" element={<Record />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/write" element={<CommunityWrite />} />
                <Route path="/community/:id" element={<CommunityDetail />} />
                <Route path="/record/:id" element={<RecordDetail />} />
                <Route path="/record/edit/:id" element={<RecordEdit />} />
                <Route path="/mylibrary" element={<MyLibrary />} />
                <Route path="/profile-edit" element={<ProfileEdit />} />
                <Route path="/purchase-history" element={<PurchaseHistory />} />
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

    return (
        <BrowserRouter>
            {/* userInfo가 없으면 null, 있으면 userInfo.id를 넘겨줌 */}
            <AppContent
                userid={userInfo ? userInfo.userid : null}
                isLoggedIn={!!userInfo}
                onLoginSuccess={(user) => setUserInfo(user)}
            />
        </BrowserRouter>
    );
}

export default App;

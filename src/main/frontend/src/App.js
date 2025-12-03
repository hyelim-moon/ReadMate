
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Header from './components/Common/Header';
import MainContent from './components/Common/MainContent';
import RecommendButton from './components/Common/RecommendButton';
import RecordList from './components/Record/RecordList';
import Record from './components/Record/Record';
import ChatBot from './components/Chat/ChatBot';
import Community from './components/Community/Community';
import CommunityWrite from "./components/Community/CommunityWrite";
import Login from "./components/User/Login";
import SignUp from "./components/User/SignUp";
import RecordDetail from './components/Record/RecordDetail';
import RecordEdit from './components/Record/RecordEdit';
import RecordButton from "./components/Record/RecordButton";
import CommunityDetail from "./components/Community/CommunityDetail";
import Search from './components/Common/Search';
import Forgot from "./components/User/Forgot";
import PointShop from "./components/Service/PointShop";
import ProductDetail from "./components/Service/ProductDetail";
import MyPage from "./components/User/MyPage";
import MyLibrary from "./components/Book/MyLibrary";
import MyBook from "./components/Book/MyBook";
import ProfileEdit from "./components/User/ProfileEdit";
import PurchaseHistory from "./components/Service/PurchaseHistory";
import Storage from "./components/Common/Storage";
import ContactList from "./components/Service/ContactList";
import Contact from "./components/Service/Contact";
import BookDetail from './components/Book/BookDetail';
import BookList from './components/Book/BookList';
import GenreList from './components/Book/GenreList';
import Challenge from "./components/Service/Challenge";
import ChallengeDetail from "./components/Service/ChallengeDetail";
import Help from "./components/Service/Help";
import PointHistory from "./components/User/PointHistory";
import SearchBookMore from "./components/Common/SearchBookMore";
import ReviewAll from "./components/Service/ReviewAll"
import MyReviews from "./components/User/MyReviews";
import Friends from "./components/User/Friends"; // Friends 컴포넌트 임포트

// ─────────────────────────────────────────────────────────────────────────────
// userId를 props로 받도록 변경
function AppContent({ userid, onLoginSuccess, isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 문의 리스트 상태
  const [inquiries, setInquiries] = useState([]);

  // 문의 추가 함수
  const addInquiry = (newInquiry) => {
    setInquiries(prev => [newInquiry, ...prev]);
  };

  // 라우트 변경 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 로그인/회원가입/비밀번호 찾기/마이페이지 경로면 헤더와 네비 숨김
  const hideGlobalHeader = ["/login", "/signup", "/forgot", "/mypage", "/myreviews"].includes(location.pathname);

  return (
      <div className="App">
        {!hideGlobalHeader && <Header />}

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
          <Route path="/friends" element={<Friends />} /> {/* Friends 라우트 추가 */}
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/recordlist" element={<RecordList />} />
          <Route path="/pointshop" element={<PointShop userid={userid} />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/help" element={<Help />} />
          <Route path="/point-history" element={<PointHistory />} />
          <Route
              path="/products/:id"
              element={<ProductDetail userid={userid} isLoggedIn={isLoggedIn} />}
          />
          <Route path="/record" element={<Record />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/booklist" element={<GenreList />} />
          <Route path="/booklist/:genre" element={<BookList />} />
          <Route path="/record/:id" element={<RecordDetail />} />
          <Route path="/record/edit/:id" element={<RecordEdit />} />
          <Route path="/mylibrary" element={<MyLibrary />} />
          <Route path="/mybook/:id" element={<MyBook />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/search/books" element={<SearchBookMore />} />
          <Route path="/books/:id/reviews" element={<ReviewAll />} />
          <Route path="/myreviews" element={<MyReviews />} />

            {/* 문의 리스트 페이지 */}
          <Route
              path="/contactlist"
              element={
                <ContactList
                    inquiries={inquiries}
                    onClickContact={() => navigate('/contact')}
                />
              }
          />
          {/* 문의 작성 페이지 */}
          <Route
              path="/contact"
              element={
                <Contact
                    onSubmitInquiry={(newInquiry) => {
                      addInquiry(newInquiry);
                      navigate('/contactlist');
                    }}
                />
              }
          />
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

  useEffect(() => {
    axios.get("http://localhost:8080/api/books/recommend")
        .then((res) => setBooks(res.data))
        .catch((err) => console.error(err));
  }, []);

  return (
      <BrowserRouter>
        {/* userInfo가 없으면 null, 있으면 userInfo.userid를 넘겨줌 */}
        <AppContent
            userid={userInfo ? userInfo.userid : null}
            isLoggedIn={!!userInfo}
            onLoginSuccess={(user) => setUserInfo(user)}
        />
      </BrowserRouter>
  );
}

export default App;

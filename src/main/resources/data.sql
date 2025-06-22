SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS saved_books;
DROP TABLE IF EXISTS books;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userid VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL UNIQUE,
  gender VARCHAR(10),
  birthdate VARCHAR(10),
  nickname VARCHAR(255),
  points INT
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    image VARCHAR(255),
    description TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- books 테이블 생성
CREATE TABLE books (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE NOT NULL,          -- ISBN 번호 (13자리 고유 값)
    book_name VARCHAR(255) NOT NULL,           -- 책 제목
    author VARCHAR(255) NOT NULL,              -- 저자
    publisher VARCHAR(255) NOT NULL,           -- 출판사
    genre VARCHAR(100),                        -- 장르
    content TEXT,                              -- 책 요약
    book_image VARCHAR(255),                   -- 책 이미지 URL
    page_count INT                             -- 페이지 수
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE saved_books (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  current_page INT DEFAULT 0,   -- 현재 읽고 있는 페이지
  total_pages INT DEFAULT 0,    -- 총 페이지 수
  started_at DATE,             -- 읽기 시작 날짜
  finished_at DATE,            -- 읽기 완료 날짜
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 저장 날짜
  CONSTRAINT fk_savedbooks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_savedbooks_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_book (user_id, book_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


INSERT INTO users (userid, password, name, email, phone, gender, birthdate, nickname, points) VALUES
('kimminsu',   '$2a$10$3mXhPB5hyTnpuUMzMk5WFOEjZ1j8.jpxshcYPZsjIq3xq.EyRMF5e', '김민수',   'kimminsu@example.com',   '010-1234-0001', 'M', '1990-05-17', '민수',   120),
('leeyounghee','$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW', '이영희',   'leeyounghee@example.com','010-1234-0002', 'F', '1992-08-03', '영희',   250),
('parkjunhyung','$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','박준형','parkjunhyung@example.com','010-1234-0003','M','1988-12-25','준형',95),
('choisujin',   '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','최수진','choisujin@example.com','010-1234-0004','F','1991-03-14','수진',180),
('jeongdaeun', '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','정다은','jeongdaeun@example.com','010-1234-0005','F','1993-07-09','다은',75),
('johyunwoo',  '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','조현우','johyunwoo@example.com','010-1234-0006','M','1987-11-30','현우',210),
('hanjimin',    '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','한지민','hanjimin@example.com','010-1234-0007','F','1994-02-21','지민',135),
('1', '$2a$10$ljNDlVSkwfXV1wLpG.MBy.Yb./whr5V0S7p/5aT.2PVw1GQMgA9Q2', 'yyy', 'yyy@example.com', '010-1234-0008', 'F', '1994-02-21', 'yyy', 100000), --1
('11', '$2a$10$ljNDlVSkwfXV1wLpG.MBy.Yb./whr5V0S7p/5aT.2PVw1GQMgA9Q2', 'y11', 'y11@example.com', '010-1234-0009', 'F', '1994-02-21', 'y11', 100000), --1
('parkjihun',   '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','박지훈','parkjihun@example.com','010-1234-0010','M','1989-04-05','지훈',145),
('kimhaneul',   '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','김하늘','kimhaneul@example.com','010-1234-0011','F','1991-10-27','하늘',200),
('sinjihye',    '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','신지혜','sinjihye@example.com','010-1234-0012','F','1993-01-15','지혜',110),
('yujawon',     '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','유재원','yujawon@example.com','010-1234-0013','M','1990-12-02','재원',155),
('kangminjun',  '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','강민준','kangminjun@example.com','010-1234-0014','M','1988-08-08','민준',130),
('leejia',      '$2a$10$e0NRaJGta0hz5oplhBWwUeXVr0GHTfZXiVYgH6Mfs2zTWU0u9yHyW','이지아','leejia@example.com','010-1234-0015','F','1994-05-23','지아',170);


INSERT INTO products (name, price, image, description) VALUES
('교보문고 기프티콘 1만원권', 10000, 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/3000000000021.jpg', '교보문고 오프라인 매장 및 온라인에서 사용 가능한 1만원권 기프티콘입니다.'),
('교보문고 기프티콘 2만원권', 20000, 'https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/3000000000038.jpg', '교보문고 오프라인 매장 및 온라인에서 사용 가능한 2만원권 기프티콘입니다.'),
('교보문고 기프티콘 3만원권', 30000, 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/3000000000045.jpg', '책을 사랑하는 사람에게 좋은 선물, 교보문고 3만원권 기프티콘입니다.'),
('교보문고 기프티콘 5만원권', 50000, 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/3000000000052.jpg', '책을 사랑하는 사람에게 좋은 선물, 교보문고 5만원권 기프티콘입니다.'),
('교보문고 기프티콘 10만원권', 100000, 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/3000000000069.jpg', '책을 사랑하는 사람에게 좋은 선물, 교보문고 10만원권 기프티콘입니다.'),
('밀리의 서재 6개월 구독권', 71400, 'https://shop-phinf.pstatic.net/20231116_118/1700120931143nloMT_JPEG/14056612100722305_1486623850.jpg?type=m510', '국내 최대 전자책 구독 서비스, 밀리의 서재 6개월 무료이용권입니다..'),
('밀리의 서재 12개월 구독권', 119000, 'https://shop-phinf.pstatic.net/20231106_106/1699260261290erhYV_JPEG/13588366126106949_2030879393.jpg?type=m510', '국내 최대 전자책 구독 서비스, 밀리의 서재 12개월 무료이용권입니다.');

INSERT INTO books (isbn, book_name, author, publisher, genre, content, book_image, page_count) VALUES
('9788954654678', '리지', '에드윈 H. 포터', '교유서가', '서양사', '“아버지가 죽었어!”\n전 세계가 경악한 살인사건, 리지 보든 연대기\n리지 보든이 도끼를 들어,\n엄마를 마흔 번 후려쳤어.\n자기가 한 짓을 본 리지,\n이번에는 아빠를 마흔한 번 후려치지.\n\n이 책은 세계적으로도 유례를 찾아보기 힘든 독특한 소재와 내용인 만큼 리지 보든 사건을 다양한 시각에서 보여주기 위해 책과 신문 기사를 포함한 4편의 논픽션을 엮어 1부와 2부, 부록 2편으로 구성했다.', 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788954654678.jpg', 348),
('9788937461095', '제인 에어 1', '샬럿 브론테', '민음사', '고전소설', '로맨스 소설의 고전 중의 고전!\n영국 문학 최초로 열정을 다룬 로맨스 소설의 고전 『제인에어』 제1권. 1847년 처음 출간된 이래, 지금까지 사랑받는 고전 중의 고전으로, 출간 당시부터 뜨거운 관심과 호응을 얻었다.\n특히 이 책은 유종호가 번역한 것으로, 19세기 빅토리아 시대 특유의 문체와 분위기를 최대한 살리면서도 독특한 맛과 기품을 간직하고 있다.', 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788937461095.jpg', 448),
('9788937461187', '폭풍의 언덕', '에밀리 브론테', '민음사', '고전소설', '열정적이면서도 비극적인 에밀리 브론테의 마지막 작품\n서른 살의 나이에 요절한 에밀리 브론테가 죽기 일년 전에 발표한 유일한 소설 작품으로, 황량한 들판 위의 외딴 저택 워더링 하이츠를 무대로 벌어지는 캐서린과 히스클리프의 비극적인 사랑, 에드거와 이사벨을 향한 히스클리프의 잔인한 복수를 그리고 있다.', 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788937461187.jpg', 572),
('9788956749213', '레베카(출간 80주년 기념판 리커버)', '대프니 듀 모리에', '현대문학', '영미소설', '앨프리드 히치콕의 영화 [레베카]와\n미하엘 쿤체 뮤지컬 [레베카]를 탄생시킨 불멸의 원작\n『레베카』 초판 출간 80주년 기념판\n20세기의 가장 영향력 있는 소설 가운데 하나. 영국 문화라는 직물 위에 아름다운 환상과 불안으로 가득한 꿈을 교차시켜 독특한 무늬를 수놓았다. 놀라우리만큼 매혹적인 작품이다.\n_세라 워터스', 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788972759065.jpg', 600),
('9788973057394', '종의 기원', '정유정', '은행나무', '한국소설', '26년 동안 숨어 있던 내 안의 또 다른 내가 왔다!\n평범했던 한 청년이 살인자로 태어나는 과정을 그린 ‘악인의 탄생기’라고. 이번 작품에서 작가는 미지의 세계가 아닌 인간, 그 내면 깊숙한 곳으로 독자들을 초대한다. 누구도 온전히 보여주지 못했던 ‘악’의 속살을 보여주고자 한다.', 'https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788956609959.jpg', 384);


-- saved_books 테이블에 더미 데이터 삽입
INSERT INTO saved_books (user_id, book_id, current_page, total_pages, started_at, finished_at, saved_at)
VALUES
  (8, 1, 50, 348, '2023-05-01', NULL, '2023-05-01'),
  (8, 2, 120, 448, '2023-06-01', NULL, '2023-06-01'),
  (8, 3, 80, 572, '2023-07-01', NULL, '2023-07-01'),
  (8, 4, 0, 600, NULL, NULL, '2023-08-01'),
  (8, 5, 384, 384, '2024-08-01', '2025-06-20', '2024-08-01');



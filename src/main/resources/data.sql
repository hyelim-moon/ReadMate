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
('9788956603474', '혼자 공부하는 파이썬', '미하엘 엔데', '한빛미디어', '프로그래밍', '파이썬을 혼자서 공부하는 방법을 다룬 책입니다.', 'https://example.com/python.jpg', 500),
('9788966269760', '자바의 정석', '도우출판', '김철수', '프로그래밍', '자바 언어의 핵심적인 내용을 다룬 정석적인 교재입니다.', 'https://example.com/java.jpg', 600),
('9788931568123', '클린 코드', '로버트 C. 마틴', '인사이트', '소프트웨어 공학', '효율적이고 깔끔한 코드를 작성하는 방법에 대해 설명하는 책입니다.', 'https://example.com/cleancode.jpg', 450),
('9788956749213', '데이터베이스 101', '김영철', '한빛미디어', 'IT', '데이터베이스 설계와 운영에 대한 기초부터 실무까지 설명한 책입니다.', 'https://example.com/database101.jpg', 350),
('9788973057394', '알고리즘 개론', '존스 홉킨스', '제이펍', '알고리즘', '알고리즘의 기초부터 고급까지를 폭넓게 다룬 교재입니다.', 'https://example.com/algorithms.jpg', 550),
('9788992943309', '실전 자바 프로그래밍', '최기범', '위키북스', '프로그래밍', '자바의 실전 활용 예제를 다룬 책입니다.', 'https://example.com/realjava.jpg', 400),
('9788972140407', '웹 개발의 정석', '박철우', '에이콘출판', '웹 개발', '웹 애플리케이션 개발에 필요한 기술을 종합적으로 다룬 책입니다.', 'https://example.com/webdev.jpg', 600),
('9788928620543', '리액트 프로젝트', '김효성', '인사이트', '프로그래밍', '리액트와 Redux를 활용한 프로젝트 기반 웹 개발 서적입니다.', 'https://example.com/reactproject.jpg', 400),
('9788994604363', '기초부터 배우는 SQL', '조원경', '로드맵', '데이터베이스', 'SQL 쿼리의 기초부터 고급 기능까지 설명한 책입니다.', 'https://example.com/sql101.jpg', 300),
('9788975600000', '파이썬 웹 개발', '박상길', '한빛미디어', '프로그래밍', '파이썬을 이용한 웹 애플리케이션 개발에 대해 다룬 책입니다.', 'https://example.com/pythonwebdev.jpg', 450);

-- saved_books 테이블에 더미 데이터 삽입
INSERT INTO saved_books (user_id, book_id, current_page, total_pages, started_at, finished_at, saved_at)
VALUES
  (8, 1, 50, 200, '2023-05-01', '2023-05-10', '2023-05-01'),
  (8, 2, 120, 300, '2023-06-01', NULL, '2023-06-01'),
  (8, 3, 80, 250, '2023-07-01', NULL, '2023-07-01'),
  (8, 4, 150, 400, '2023-08-01', NULL, '2023-08-01'),
  (8, 5, 0, 400, NULL, NULL, '2023-08-01'),
  (8, 6, 500, 500, '2024-08-01', '2025-06-20', '2024-08-01');



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
  isbn VARCHAR(13) UNIQUE,
  book_name VARCHAR(255) NOT NULL,
  book_image VARCHAR(255),
  genre VARCHAR(100),
  publisher VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- saved_books 테이블 생성 (유저가 저장한 책 기록)
CREATE TABLE saved_books (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  started_at DATE,
  finished_at DATE,
  progress INT DEFAULT 0,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

-- books 더미 데이터 삽입
INSERT INTO books (isbn, book_name, book_image, genre, publisher) VALUES
('9788956603474', '혼자 공부하는 파이썬', 'https://example.com/python.jpg', '프로그래밍', '한빛미디어'),
('9788966269760', '자바의 정석', 'https://example.com/java.jpg', '프로그래밍', '도우출판'),
('9788931568123', '클린 코드', 'https://example.com/cleancode.jpg', '소프트웨어 공학', '인사이트');

INSERT INTO saved_books (user_id, book_id, started_at, finished_at, progress, saved_at) VALUES
(8, 1, '2025-05-01', NULL, 40, '2025-06-01'),  -- 혼자 공부하는 파이썬, 진행중 40%
(8, 2, '2025-04-15', '2025-05-20', 100, '2025-05-21'),  -- 자바의 정석, 완료
(8, 3, '2025-06-10', NULL, 10, '2025-06-15');  -- 클린 코드, 시작한 지 얼마 안됨


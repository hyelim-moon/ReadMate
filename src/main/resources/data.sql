CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       nickname VARCHAR(255),
                       points INT
);



INSERT INTO users (nickname, points) VALUES ('Alice', 120);
INSERT INTO users (nickname, points) VALUES ('Bob', 150);
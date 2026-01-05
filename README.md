# ReadMate
AI 기반 독서 기록 및 개인화 도서 추천 서비스 (Spring Boot + React)

---

## Overview
ReadMate는 사용자가 독서 기록(평점/메모/이력)을 남길 수 있는 서비스로,
기분·감정·날씨 등 그날의 상태를 바탕으로 AI에게 질문해 상황에 맞는 도서를 추천받을 수 있습니다.
또한 Google Books 등 외부 도서 데이터를 연동하여 도서 메타정보(설명, 표지, 출판 정보 등)를 보강합니다.

같은 책을 기록한 사용자들과 의견을 나누는 커뮤니티 기능을 제공하며,
기록/활동에 따라 포인트가 적립되는 구조를 통해 꾸준한 독서 기록 습관 형성과 참여 동기 부여를 목표로 합니다.

---

## Key Features
- 회원가입/로그인 및 JWT 기반 인증/인가
- 독서 기록 저장 및 조회 (평점, 메모, 독서 상태)
- 사용자 독서 이력 기반 개인화 도서 추천
- Google Books API 연동을 통한 도서 검색 및 메타데이터 수집
- 외부 API 응답 파싱 및 데이터 정제 처리

---

## Tech Stack
### Backend
- Java 17
- Spring Boot 3.4.4
- Spring MVC, Spring WebFlux (WebClient)
- Spring Data JPA, Spring Security
- JWT (jjwt 0.11.5)
- MySQL Connector/J 8.0.33
- Google OAuth2 / Google HTTP Client
- Jsoup, org.json
- Lombok

### Frontend
- React (src/main/frontend)
- Axios
- remark-gfm

---

## API Documentation
로컬 실행 후 Swagger UI를 통해 API 명세를 확인할 수 있습니다.

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

---

## Architecture
- React 애플리케이션을 Spring Boot 프로젝트 내부(`src/main/frontend`)에서 관리
- 배포 시 React 빌드 결과물을 Spring Boot `resources/static`에 포함하여 단일 배포 단위로 구성
- 외부 도서 API 호출은 WebClient(WebFlux) 기반으로 처리하여
  응답 지연 및 실패 상황에 대비한 안정적인 연동 구조를 설계

---

## Project Structure
```text
ReadMate
├─ build.gradle
├─ package.json
└─ src
   └─ main
      ├─ java
      ├─ resources
      │  └─ static
      └─ frontend

---

## Build & Run

### Backend (Dev)
```bash
./gradlew bootRun

Frontend (Dev)
npm start

Production Build (React 포함)
./gradlew build -Pprod

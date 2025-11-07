package RM.ReadMate.service;

public class HeuristicGenreClassifier {

    /** 제목/내용/출판사/저자 키워드로 장르 추정 (최후의 보루) */
    public static String guess(String title, String content, String publisher, String author) {
        String t = safe(title).toLowerCase();
        String c = safe(content).toLowerCase();
        String p = safe(publisher).toLowerCase();
        String a = safe(author).toLowerCase();

        // 만화/웹툰/그래픽노블
        if (has(t,c,p,"만화","웹툰","코믹스","그래픽노블","cartoon","comics","graphic novel","manga")) return "만화";

        // 시/희곡
        if (has(t,c,"시집","시편","poem","poetry") || has(t,"희곡","drama","play")) return "시/희곡";

        // 에세이
        if (has(t,c,"에세이","수필","산문","에스에이","essay")) return "에세이";

        // 소설/장편/단편/문학상
        if (has(t,c,"소설","novel","장편","단편","문학상","문학상수상")) return "소설";

        // 추리/스릴러/미스터리
        if (has(t,c,"추리","스릴러","미스터리","detective","mystery","thriller")) return "추리/미스터리";

        // SF/판타지
        if (has(t,c,"sf","science fiction","사이파이","판타지","fantasy")) return "SF/판타지";

        // 경제/경영/투자/주식/부동산
        if (has(t,c,"경제","경영","매출","마케팅","브랜딩","리더십","회계","재무","주식","투자","부동산","etf","코인","경제학","비즈니스","business","management")) return "경제/경영";

        // 자기계발
        if (has(t,c,"자기계발","자기개발","성장","습관","동기부여","mindset","self-help","self help","성공학")) return "자기계발";

        // 인문
        if (has(t,c,"인문","철학","교양","humanities","philosophy")) return "인문";

        // 사회/정치/법
        if (has(t,c,"사회","정치","국제","법","헌법","행정","외교","사회학","politics","sociology","law")) return "사회/정치";

        // 역사
        if (has(t,c,"역사","한국사","세계사","고대사","근현대사","history")) return "역사";

        // 과학
        if (has(t,c,"과학","물리","화학","생물","수학","천문","지구과학","science","physics","chemistry","biology","math")) return "과학";

        // 기술/IT/프로그래밍/데이터/AI
        if (has(t,c,"it","컴퓨터","프로그래밍","코딩","개발자","자바","파이썬","스프링","데이터","ai","인공지능","알고리즘","database","클라우드","docker","kubernetes","react","spring")) return "기술/IT";

        // 예술/대중문화
        if (has(t,c,"예술","미술","디자인","사진","음악","영화","대중문화","art","music","film","photography")) return "예술/대중문화";

        // 종교
        if (has(t,c,"종교","기독교","천주교","불교","이슬람","성경","불경","코란","religion")) return "종교";

        // 교육/학습/수험
        if (has(t,c,"교육","학습","공부법","수능","수험","토익","토플","교재","문제집","스터디","study","education")) return "교육/학습";

        // 유아/아동/청소년
        if (has(t,c,"유아","아동","키즈","청소년","동화","그림책","young adult","juvenile")) return "유아/아동/청소년";

        // 여행
        if (has(t,c,"여행","트래블가이드","travel guide","배낭여행","코스","루트")) return "여행";

        // 요리
        if (has(t,c,"요리","레시피","베이킹","쿠킹","cookbook","cooking","recipe","디저트")) return "요리";

        // 건강/취미/스포츠
        if (has(t,c,"건강","운동","피트니스","다이어트","요가","러닝","헬스","취미","정원","원예","낚시","sports","hobby")) return "건강/취미";

        // 가정/육아
        if (has(t,c,"가정","살림","정리수납","육아","부모","임신","parenting","house")) return "가정/육아";

        // 외국어
        if (has(t,c,"외국어","어학","영어","일본어","중국어","독일어","스페인어","회화","문법","listening","reading","grammar")) return "외국어";

        // 못 맞추면 null
        return null;
    }

    private static boolean has(String... words) {
        String h = words[0];
        for (int i=1; i<words.length; i++) {
            if (h.contains(words[i])) return true;
        }
        return false;
    }

    private static String safe(String s) { return s == null ? "" : s; }
}

package RM.ReadMate.service;

import RM.ReadMate.entity.Book;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * "소설" 장르를 4개 하위 분류(고전 소설 / 영미소설 / 한국소설 / 소설)로 세분화합니다.
 * 규칙은 가벼운 휴리스틱으로 구성되어 있으며, 명확하지 않으면 기본값 "소설"을 반환합니다.
 */
public class NovelSubgenreClassifier {

    private static final Pattern HANGUL = Pattern.compile("[가-힣]");
    private static final Pattern ASCII_LETTERS = Pattern.compile("[A-Za-z]");

    private static final List<String> CLASSIC_HINTS = Arrays.asList(
            "고전", "명작", "클래식", "문학전집", "세계문학전집", "원전", "완역", "전집"
    );

    private static final List<String> CLASSIC_AUTHORS = Arrays.asList(
            // 영미/유럽 고전 작가 일부 (확장 가능)
            "제인 오스틴","찰스 디킨스","토머스 하디","에밀리 브론테","샬럿 브론테",
            "조지 엘리엇","허먼 멜빌","마크 트웨인","아서 코난 도일","오스카 와일드",
            "버지니아 울프","제임스 조이스","조지 오웰","윌리엄 포크너",
            "레프 톨스토이","표도르 도스토예프스키","니콜라이 고골","이반 투르게네프",
            "빅토르 위고","귀스타브 플로베르","오노레 드 발자크","알렉상드르 뒤마",
            "프란츠 카프카","알베르 카뮈","안톤 체호프"
    );

    private static final List<String> KOREAN_PUBLISHERS = Arrays.asList(
            "문학동네","민음사","창비","문학과지성사","현대문학","은행나무","비채","황금가지",
            "자음과모음","달","열린책들","민음사 세계문학","도서출판","한겨레","위즈덤하우스",
            "웅진","알마","마음산책","창작과비평","민음사(민음사)"
    );

    private static final List<String> ENGLISH_PUBLISHERS = Arrays.asList(
            "penguin","harpercollins","random house","vintage","scribner",
            "simon & schuster","bloomsbury","hachette","macmillan",
            "oxford","cambridge","faber","anchor","picador"
    );

    /** 메인 진입점: 제목/저자/출판사/내용 등을 바탕으로 세부 분류 */
    public static String classify(Book b) {
        String title = safe(b.getBookName());
        String author = safe(b.getAuthor());
        String publisher = safe(b.getPublisher());
        String content = safe(b.getContent());

        if (isClassic(title, author, content)) {
            return "고전소설";
        }

        if (isKorean(author, publisher)) {
            return "한국소설";
        }

        if (isEnglishAmerican(author, publisher)) {
            return "영미소설";
        }

        return "소설";
    }

    private static boolean isClassic(String title, String author, String content) {
        String t = title.toLowerCase();
        String c = content.toLowerCase();

        for (String hint : CLASSIC_HINTS) {
            if (t.contains(hint) || c.contains(hint)) return true;
        }
        for (String a : CLASSIC_AUTHORS) {
            if (author.contains(a)) return true;
        }
        if (t.contains("classic") || c.contains("classic")) return true;

        return false;
    }

    private static boolean isKorean(String author, String publisher) {
        boolean authorKorean = HANGUL.matcher(author).find();
        if (authorKorean) return true;

        String p = publisher.toLowerCase();
        for (String kp : KOREAN_PUBLISHERS) {
            if (publisher.contains(kp) || p.contains(kp)) return true;
        }
        return false;
    }

    private static boolean isEnglishAmerican(String author, String publisher) {
        boolean authorAscii = ASCII_LETTERS.matcher(author).find() && !HANGUL.matcher(author).find();
        String p = publisher.toLowerCase();

        if (authorAscii) return true;

        for (String ep : ENGLISH_PUBLISHERS) {
            if (p.contains(ep)) return true;
        }
        return false;
    }

    private static String safe(String s) { return s == null ? "" : s; }
}

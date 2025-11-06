package RM.ReadMate.service;

import java.util.Locale;

/** 외부 API 카테고리 → 내부 표준 장르(국문) */
public class GenreMapper {

    private static String norm(String s) { return s; } // 필요하면 네 표기로 변경

    // 알라딘 categoryName → 내부
    public static String mapFromAladin(String categoryName) {
        if (categoryName == null) return null;
        String s = categoryName.replace(" ", "").toLowerCase(Locale.ROOT);

        if (s.contains("소설") || s.contains("fiction") || s.contains("장편소설") || s.contains("단편소설")) return norm("소설");
        if (s.contains("시") || s.contains("희곡") || s.contains("시집")) return norm("시/희곡");
        if (s.contains("문학") || s.contains("고전")) return norm("문학");
        if (s.contains("에세이") || s.contains("수필") || s.contains("산문")) return norm("에세이");
        if (s.contains("만화") || s.contains("코믹스") || s.contains("웹툰") || s.contains("그래픽노블")) return norm("만화");
        if (s.contains("경제경영") || s.contains("경제") || s.contains("경영") || s.contains("biz")) return norm("경제/경영");
        if (s.contains("자기계발") || s.contains("자기개발") || s.contains("selfhelp")) return norm("자기계발");
        if (s.contains("인문") || s.contains("철학")) return norm("인문");
        if (s.contains("사회") || s.contains("정치") || s.contains("사회과학") || s.contains("법")) return norm("사회/정치");
        if (s.contains("역사") || s.contains("세계사") || s.contains("한국사")) return norm("역사");
        if (s.contains("과학") || s.contains("자연과학")) return norm("과학");
        if (s.contains("기술") || s.contains("it") || s.contains("컴퓨터") || s.contains("공학") || s.contains("데이터") || s.contains("ai")) return norm("기술/IT");
        if (s.contains("예술") || s.contains("대중문화") || s.contains("영화") || s.contains("음악") || s.contains("사진")) return norm("예술/대중문화");
        if (s.contains("종교")) return norm("종교");
        if (s.contains("교육") || s.contains("수험") || s.contains("참고서") || s.contains("교재") || s.contains("학습")) return norm("교육/학습");
        if (s.contains("유아") || s.contains("아동") || s.contains("청소년")) return norm("유아/아동/청소년");
        if (s.contains("여행")) return norm("여행");
        if (s.contains("요리") || s.contains("레시피") || s.contains("베이킹")) return norm("요리");
        if (s.contains("건강") || s.contains("취미") || s.contains("스포츠")) return norm("건강/취미");
        if (s.contains("가정") || s.contains("육아") || s.contains("살림") || s.contains("집")) return norm("가정/육아");
        if (s.contains("외국어") || s.contains("어학") || s.contains("영어") || s.contains("일본어")) return norm("외국어");
        if (s.contains("미스터리") || s.contains("추리") || s.contains("스릴러")) return norm("추리/미스터리");
        if (s.contains("sf") || s.contains("공상과학") || s.contains("판타지")) return norm("SF/판타지");
        return null;
    }

    // 구글 categories → 내부
    public static String mapFromGoogle(String category) {
        if (category == null) return null;
        String s = category.toLowerCase(Locale.ROOT);

        if (s.contains("fiction")) return norm("소설");
        if (s.contains("poetry") || s.contains("drama")) return norm("시/희곡");
        if (s.contains("literary") || s.contains("classics")) return norm("문학");
        if (s.contains("essays")) return norm("에세이");
        if (s.contains("comics") || s.contains("graphic novels") || s.contains("manga")) return norm("만화");
        if (s.contains("business") || s.contains("economics") || s.contains("management")) return norm("경제/경영");
        if (s.contains("self-help")) return norm("자기계발");
        if (s.contains("philosophy") || s.contains("humanities")) return norm("인문");
        if (s.contains("social science") || s.contains("political") || s.contains("law")) return norm("사회/정치");
        if (s.contains("history")) return norm("역사");
        if (s.contains("science")) return norm("과학");
        if (s.contains("computers") || s.contains("technology") || s.contains("engineering")) return norm("기술/IT");
        if (s.contains("art") || s.contains("performing arts") || s.contains("music") || s.contains("photography")) return norm("예술/대중문화");
        if (s.contains("religion")) return norm("종교");
        if (s.contains("education") || s.contains("study aids")) return norm("교육/학습");
        if (s.contains("juvenile") || s.contains("young adult")) return norm("유아/아동/청소년");
        if (s.contains("travel")) return norm("여행");
        if (s.contains("cooking")) return norm("요리");
        if (s.contains("health") || s.contains("sports") || s.contains("hobbies")) return norm("건강/취미");
        if (s.contains("family") || s.contains("parenting") || s.contains("house & home")) return norm("가정/육아");
        if (s.contains("foreign language") || s.contains("language arts")) return norm("외국어");
        if (s.contains("mystery") || s.contains("detective") || s.contains("thriller")) return norm("추리/미스터리");
        if (s.contains("science fiction") || s.contains("fantasy")) return norm("SF/판타지");
        return null;
    }

    public static String chooseBest(String fromAladin, String fromGoogle) {
        if (fromAladin != null && !fromAladin.isBlank()) return fromAladin;
        if (fromGoogle != null && !fromGoogle.isBlank()) return fromGoogle;
        return null;
    }
}

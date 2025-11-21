package RM.ReadMate.service;

import java.util.Locale;

/** 외부 API 카테고리 문자열 → 내부 표준 장르(국문) 매핑 */
public class GenreMapper {

    private static String norm(String s) { return s; }

    /** Aladin categoryName → 내부 */
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
        if (s.contains("사회") || s.contains("정치") || s.contains("법") || s.contains("사회과학")) return norm("사회/정치/법");
        if (s.contains("역사") || s.contains("전기") || s.contains("한국사") || s.contains("세계사")) return norm("역사/전기");
        if (s.contains("종교") || s.contains("기독교") || s.contains("불교") || s.contains("천주교")) return norm("종교");

        if (s.contains("과학") || s.contains("자연과학") || s.contains("수학") || s.contains("물리") || s.contains("화학") || s.contains("생물")) return norm("과학");
        if (s.contains("컴퓨터") || s.contains("it") || s.contains("기술") || s.contains("프로그래밍") || s.contains("인터넷")) return norm("컴퓨터/IT");
        if (s.contains("교육") || s.contains("학습") || s.contains("수험서")) return norm("교육");
        if (s.contains("건강") || s.contains("취미") || s.contains("스포츠") || s.contains("레저")) return norm("건강/취미");
        if (s.contains("가정") || s.contains("육아") || s.contains("집")) return norm("가정/육아");
        if (s.contains("외국어") || s.contains("어학")) return norm("외국어");

        if (s.contains("추리") || s.contains("미스터리") || s.contains("스릴러")) return norm("추리/미스터리");
        if (s.contains("sf") || s.contains("판타지")) return norm("SF/판타지");

        if (s.contains("여행")) return norm("여행");
        if (s.contains("예술") || s.contains("사진") || s.contains("디자인")) return norm("예술/사진");
        if (s.contains("요리") || s.contains("음식") || s.contains("와인")) return norm("요리");
        if (s.contains("어린이") || s.contains("아동")) return norm("어린이");
        if (s.contains("청소년") || s.contains("teen")) return norm("청소년");

        return null;
    }

    /** Google categories → 내부 */
    public static String mapFromGoogle(String category) {
        if (category == null) return null;
        String s = category.toLowerCase(Locale.ROOT);

        if (s.contains("fiction")) return norm("소설");
        if (s.contains("poetry") || s.contains("drama")) return norm("시/희곡");
        if (s.contains("literary") || s.contains("classics")) return norm("문학");
        if (s.contains("essays")) return norm("에세이");
        if (s.contains("comics") || s.contains("graphic")) return norm("만화");

        if (s.contains("business") || s.contains("economics") || s.contains("management") || s.contains("finance") || s.contains("marketing")) return norm("경제/경영");
        if (s.contains("self-help") || s.contains("self help") || s.contains("personal development")) return norm("자기계발");

        if (s.contains("philosophy") || s.contains("humanities") || s.contains("ethics")) return norm("인문");
        if (s.contains("social science") || s.contains("sociology") || s.contains("political science") || s.contains("law")) return norm("사회/정치/법");
        if (s.contains("history") || s.contains("biography") || s.contains("memoir")) return norm("역사/전기");
        if (s.contains("religion") || s.contains("spirituality")) return norm("종교");

        if (s.contains("science") || s.contains("mathematics") || s.contains("astronomy") || s.contains("physics") || s.contains("chemistry") || s.contains("biology")) return norm("과학");
        if (s.contains("computer") || s.contains("programming") || s.contains("software") || s.contains("technology") || s.contains("tech")) return norm("컴퓨터/IT");
        if (s.contains("education") || s.contains("study aids") || s.contains("teaching")) return norm("교육");
        if (s.contains("health") || s.contains("sports") || s.contains("fitness") || s.contains("hobbies") || s.contains("crafts")) return norm("건강/취미");
        if (s.contains("family") || s.contains("parenting") || s.contains("house & home") || s.contains("home")) return norm("가정/육아");
        if (s.contains("language arts") || s.contains("foreign language") || s.contains("language")) return norm("외국어");

        if (s.contains("mystery") || s.contains("detective") || s.contains("thriller") || s.contains("crime")) return norm("추리/미스터리");
        if (s.contains("science fiction") || s.contains("sf") || s.contains("fantasy")) return norm("SF/판타지");

        if (s.contains("travel")) return norm("여행");
        if (s.contains("art") || s.contains("photography") || s.contains("design")) return norm("예술/사진");
        if (s.contains("cook") || s.contains("cooking") || s.contains("food") || s.contains("wine")) return norm("요리");
        if (s.contains("children") || s.contains("juvenile")) return norm("어린이");
        if (s.contains("young adult") || s.contains("ya")) return norm("청소년");

        return null;
    }

    public static String chooseBest(String fromAladin, String fromGoogle) {
        if (fromAladin != null && !fromAladin.isBlank()) return fromAladin;
        if (fromGoogle != null && !fromGoogle.isBlank()) return fromGoogle;
        return null;
    }
}

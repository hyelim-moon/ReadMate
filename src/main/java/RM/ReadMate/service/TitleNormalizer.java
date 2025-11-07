package RM.ReadMate.service;

import java.util.regex.Pattern;

public class TitleNormalizer {

    private static final Pattern P_PAREN = Pattern.compile("\\s*[\\(\\[\\{〈《「【].*?[\\)\\]\\}〉》」】]");
    private static final Pattern P_SERIES = Pattern.compile("\\s*[:\\-–—]\\s*.*$"); // "제목 - 부제"
    private static final Pattern P_VOL = Pattern.compile("\\b(제?\\s*\\d+\\s*권|\\d+\\s*권|vol\\.?\\s*\\d+|volume\\s*\\d+)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern P_EP = Pattern.compile("\\b(완전판|합본|증보|개정|특별판)\\b");
    private static final Pattern P_DOTS = Pattern.compile("\\s*[·•∙‧]+\\s*");
    private static final Pattern P_MULTI_SPACE = Pattern.compile("\\s{2,}");

    public static String cleanTitle(String title) {
        if (title == null) return "";
        String t = title.trim();
        t = P_PAREN.matcher(t).replaceAll("");
        t = P_SERIES.matcher(t).replaceAll("");
        t = P_VOL.matcher(t).replaceAll("");
        t = P_EP.matcher(t).replaceAll("");
        t = P_DOTS.matcher(t).replaceAll(" ");
        t = P_MULTI_SPACE.matcher(t).replaceAll(" ");
        return t.trim();
    }

    public static String primaryAuthor(String author) {
        if (author == null) return "";
        String a = author.replaceAll("\\(.*?\\)", ""); // (지은이)/(옮긴이) 제거
        a = a.split(",|\\/|\\||·|•|∙|&")[0];
        return a.trim();
    }

    public static String cleanIsbn(String isbn) {
        if (isbn == null) return "";
        return isbn.replaceAll("[^0-9Xx]", "").trim();
    }
}

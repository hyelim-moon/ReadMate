package RM.ReadMate.dto;

import java.util.List;

public record BestsellerDto(
        int rank,                // 1,2,3...
        String title,
        List<String> authors,
        String isbn13,
        String publisher,
        String pubDate,          // yyyy-MM-dd (없으면 null)
        String cover,            // 알라딘 표지
        String previewLink,      // Google Books 미리보기 링크
        String description       // Google Books 설명 (짧게)
) {}
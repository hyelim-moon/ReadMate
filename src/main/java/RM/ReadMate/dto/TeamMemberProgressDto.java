package RM.ReadMate.dto;

import RM.ReadMate.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty; // JsonProperty 임포트 추가
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class TeamMemberProgressDto {
    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private int booksRead; // 해당 챌린지 기간 동안 읽은 책 수
    
    @JsonProperty("isLeader") // JSON 직렬화 시 필드 이름을 명시적으로 지정
    private boolean isLeader; // 방장 여부 추가

    public TeamMemberProgressDto(User user, int booksRead, boolean isLeader) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImageUrl = user.getProfileImageUrl();
        this.booksRead = booksRead;
        this.isLeader = isLeader;
    }
}

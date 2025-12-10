package RM.ReadMate.dto;

import RM.ReadMate.entity.User;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class TeamMemberProgressDto {
    private Long userId;
    private String nickname;
    private String profileImageUrl;
    private int booksRead; // 해당 챌린지 기간 동안 읽은 책 수
    private boolean isLeader; // 방장 여부 추가

    public TeamMemberProgressDto(User user, int booksRead, boolean isLeader) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImageUrl = user.getProfileImageUrl();
        this.booksRead = booksRead;
        this.isLeader = isLeader;
    }
}

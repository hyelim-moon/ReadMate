package RM.ReadMate.dto;

import RM.ReadMate.entity.User;
import lombok.Getter;

@Getter
public class UserRankingDTO {
    private int rank;
    private String nickname;

    public User toEntity() {
        return User.builder()
                .points(0)
                .nickname(nickname).build();
    }
    public UserRankingDTO(int rank, String nickName) {
        this.rank = rank;
        this.nickname = nickName;
    }
}

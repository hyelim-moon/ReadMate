package RM.ReadMate.dto;

import RM.ReadMate.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserRankingDTO {
    private int rank;
    private String nickname;
    private int points;

    public User toEntity() {
        return User.builder()
                .nickname(nickname)
                .points(points)
                .build();
    }
}

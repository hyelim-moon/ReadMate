package RM.ReadMate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendDTO {
    private Long id;
    private String nickname;
    // 필요한 경우 다른 사용자 정보 추가
}

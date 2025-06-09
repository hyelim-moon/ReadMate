package RM.ReadMate.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;     // 발급된 JWT
    private String userid;    // 로그인에 사용된 userid
    private String name;      // 회원 이름
    private String email;     // 이메일(추가정보)
    private String phone;     // 전화번호(추가정보)
    private int points;       // 포인트(추가정보)
}

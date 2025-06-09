package RM.ReadMate.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String userid;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private String birthdate; // "YYYY-MM-DD"
    private String nickname;
}

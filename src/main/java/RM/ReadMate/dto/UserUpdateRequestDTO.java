package RM.ReadMate.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequestDTO {
    private String nickname;
    private String email;
    private String phone;
    private String birthdate;
    private String name;
    private PasswordUpdateDTO passwordUpdate;  // 추가

    @Getter
    @Setter
    public static class PasswordUpdateDTO {
        private String currentPassword;
        private String newPassword;
    }
}


package RM.ReadMate.dto;

import RM.ReadMate.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private UserDTO user;

    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = new UserDTO(user);
    }

    @Getter
    @Setter
    public static class UserDTO {
        private Long id; // User 엔티티의 Primary Key ID 추가
        private String userid;
        private String name;
        private String email;
        private String phone;
        private int points;

        public UserDTO(User user) {
            this.id = user.getId(); // User 엔티티의 실제 ID 할당
            this.userid = user.getUserid();
            this.name = user.getName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.points = user.getPoints();
        }
    }
}

package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userid;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column
    private String gender;  // 남자/여자 혹은 M/F 등 원하는 형식

    @Column
    private String birthdate;  // "YYYY-MM-DD" 형식 문자열

    @Column
    private String nickname;

    @Setter  // points 필드에 setter 추가
    @Column
    private int points;

    public User(String nickname, int points) {
        this.nickname = nickname;
        this.points = points;
    }
}

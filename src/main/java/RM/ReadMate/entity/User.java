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

    @Setter  // name 필드에 setter 추가
    @Column(nullable = false)
    private String name;

    @Setter  // email 필드에 setter 추가
    @Column(nullable = false, unique = true)
    private String email;

    @Setter  // phone 필드에 setter 추가
    @Column(nullable = false, unique = true)
    private String phone;

    @Setter  // gender 필드에 setter 추가, 필요하다면
    @Column
    private String gender;

    @Setter  // birthdate 필드에 setter 추가
    @Column
    private String birthdate;

    @Setter  // nickname 필드에 setter 추가
    @Column
    private String nickname;

    @Setter  // points 필드에 setter 추가 (이미 있음)
    @Column
    private int points;

    public User(String nickname, int points) {
        this.nickname = nickname;
        this.points = points;
    }
}

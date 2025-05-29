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

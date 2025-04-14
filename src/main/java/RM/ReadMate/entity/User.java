package RM.ReadMate.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String nickname;

    @Column
    private int points;

    @Builder
    public User(String nickname, int points) {
        this.nickname = nickname;
        this.points = points;
    }
    public Long getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public int getPoints() {
        return points;
    }
}

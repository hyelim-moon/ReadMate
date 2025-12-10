package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String name;

    // @OneToMany 대신 @ManyToMany로 변경하여 다대다 관계 설정
    // joinColumns: Team 엔티티의 외래 키 (team_id)
    // inverseJoinColumns: User 엔티티의 외래 키 (user_id)
    @ManyToMany
    @JoinTable(
        name = "team_members", // 조인 테이블 이름
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();
}

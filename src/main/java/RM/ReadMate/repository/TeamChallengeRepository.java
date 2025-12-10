package RM.ReadMate.repository;

import RM.ReadMate.entity.Team;
import RM.ReadMate.entity.TeamChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamChallengeRepository extends JpaRepository<TeamChallenge, Long> {
    List<TeamChallenge> findByTeam(Team team);
}

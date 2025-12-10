package RM.ReadMate.service;

import RM.ReadMate.entity.Challenge; // Challenge 임포트 제거 예정
import RM.ReadMate.entity.Team;
import RM.ReadMate.entity.TeamChallenge; // TeamChallenge 임포트 제거 예정
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.ChallengeRepository; // ChallengeRepository 제거 예정
import RM.ReadMate.repository.TeamChallengeRepository; // TeamChallengeRepository 제거 예정
import RM.ReadMate.repository.TeamRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    // private final ChallengeRepository challengeRepository; // 제거
    // private final TeamChallengeRepository teamChallengeRepository; // 제거

    @Transactional
    public Team createTeam(String name, Long leaderId) {
        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("Leader not found with ID: " + leaderId));

        Team team = new Team();
        team.setName(name);
        List<User> members = new ArrayList<>();
        members.add(leader);
        team.setMembers(members);
        return teamRepository.save(team);
    }

    @Transactional
    public Team addMember(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (team.getMembers().contains(user)) {
            throw new IllegalArgumentException("User is already a member of this team.");
        }

        team.getMembers().add(user);
        return teamRepository.save(team);
    }

    // joinChallenge 메서드 제거
    /*
    @Transactional
    public TeamChallenge joinChallenge(Long teamId, Long challengeId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + challengeId));

        TeamChallenge teamChallenge = new TeamChallenge();
        teamChallenge.setTeam(team);
        teamChallenge.setChallenge(challenge); // 이 부분이 문제 발생
        return teamChallengeRepository.save(teamChallenge);
    }
    */

    public List<Team> getTeams() {
        return teamRepository.findAll();
    }

    // getTeamChallenges 메서드 제거 (TeamChallengeService로 이동)
    /*
    public List<TeamChallenge> getTeamChallenges(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + teamId));
        return teamChallengeRepository.findByTeam(team);
    }
    */
}

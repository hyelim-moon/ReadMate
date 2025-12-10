package RM.ReadMate.service;

import RM.ReadMate.dto.CreateTeamChallengeRequestDto;
import RM.ReadMate.dto.TeamChallengeDto;
import RM.ReadMate.dto.TeamMemberProgressDto;
import RM.ReadMate.entity.Team;
import RM.ReadMate.entity.TeamChallenge;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.RecordRepository;
import RM.ReadMate.repository.TeamChallengeRepository;
import RM.ReadMate.repository.TeamRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamChallengeService {

    private final TeamChallengeRepository teamChallengeRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final RecordRepository recordRepository;

    public List<TeamChallengeDto> getAllTeamChallenges() {
        List<TeamChallenge> teamChallenges = teamChallengeRepository.findAll();
        return teamChallenges.stream()
                .map(TeamChallengeDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamChallenge createTeamChallenge(CreateTeamChallengeRequestDto requestDto) {
        // 1. 현재 로그인한 사용자 정보 가져오기
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        User leader = userRepository.findByUserid(currentUserIdStr)
                .orElseThrow(() -> new IllegalArgumentException("리더 정보를 찾을 수 없습니다."));

        // 2. 새로운 팀 생성 및 리더 설정
        Team team = new Team();
        team.setName(requestDto.getRoomName());
        
        teamRepository.save(team); // 먼저 팀을 저장하여 teamId를 할당받음

        List<User> members = new ArrayList<>();
        members.add(leader);
        
        // 3. 초대된 친구 멤버에 추가
        if (requestDto.getInvitedFriendIds() != null && !requestDto.getInvitedFriendIds().isEmpty()) {
            List<User> invitedFriends = userRepository.findAllById(requestDto.getInvitedFriendIds());
            members.addAll(invitedFriends);
        }
        
        // Team의 members 리스트에 추가
        team.setMembers(members);
        // 각 User의 teams 리스트에도 이 team을 추가 (양방향 관계 관리)
        for (User member : members) {
            member.getTeams().add(team);
            userRepository.save(member); // User 엔티티 업데이트
        }
        teamRepository.save(team); // Team 엔티티 업데이트 (members 관계 저장)


        // 4. TeamChallenge 엔티티에 챌린지 정보 직접 설정
        TeamChallenge teamChallenge = new TeamChallenge();
        teamChallenge.setTeam(team);
        teamChallenge.setChallengeTitle(requestDto.getChallengeTitle());
        teamChallenge.setChallengeDescription(requestDto.getChallengeDescription());
        teamChallenge.setStartDate(LocalDate.now()); // 현재 날짜를 시작일로 설정
        teamChallenge.setEndDate(requestDto.getEndDate());
        teamChallenge.setGoalQuantity(requestDto.getGoalQuantity());
        teamChallenge.setLeaderId(leader.getId()); // 방장 ID 설정

        return teamChallengeRepository.save(teamChallenge);
    }

    // 특정 팀 챌린지 상세 정보 조회
    public TeamChallengeDto getTeamChallengeDetails(Long teamChallengeId) {
        TeamChallenge teamChallenge = teamChallengeRepository.findById(teamChallengeId)
                .orElseThrow(() -> new IllegalArgumentException("팀 챌린지를 찾을 수 없습니다. ID: " + teamChallengeId));

        Team team = teamChallenge.getTeam();

        if (team == null) {
            throw new IllegalStateException("팀 챌린지 데이터가 불완전합니다.");
        }

        // 챌린지 시작일과 종료일을 LocalDateTime으로 변환
        LocalDateTime startDateTime = teamChallenge.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = teamChallenge.getEndDate().atTime(23, 59, 59); // 종료일의 마지막 시간까지 포함

        List<TeamMemberProgressDto> membersProgress = team.getMembers().stream()
                .map(member -> {
                    // 각 멤버의 챌린지 기간 동안 읽은 책 수 계산
                    int booksRead = recordRepository.countByUserAndRecordDateBetween(
                        member, 
                        startDateTime, 
                        endDateTime    
                    );
                    boolean isLeader = member.getId().equals(teamChallenge.getLeaderId()); // 방장 여부 확인
                    return new TeamMemberProgressDto(member, booksRead, isLeader);
                })
                .collect(Collectors.toList());

        return new TeamChallengeDto(teamChallenge, membersProgress);
    }

    // 팀 챌린지 참여
    @Transactional
    public TeamChallenge joinTeamChallenge(Long teamChallengeId) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        User userToJoin = userRepository.findByUserid(currentUserIdStr)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        TeamChallenge teamChallenge = teamChallengeRepository.findById(teamChallengeId)
                .orElseThrow(() -> new IllegalArgumentException("팀 챌린지를 찾을 수 없습니다. ID: " + teamChallengeId));

        Team team = teamChallenge.getTeam();
        if (team == null) {
            throw new IllegalStateException("팀 챌린지에 연결된 팀이 없습니다.");
        }

        // 이미 팀 멤버인지 확인
        boolean isAlreadyMember = team.getMembers().stream()
                                    .anyMatch(member -> member.getId().equals(userToJoin.getId()));
        if (isAlreadyMember) {
            throw new IllegalStateException("이미 팀 챌린지에 참여하고 있습니다.");
        }

        // 최대 멤버 수 확인 (임시로 10명으로 가정)
        if (team.getMembers().size() >= 10) { // maxMembers는 Team 엔티티에 추가하는 것이 좋음
            throw new IllegalStateException("팀 챌린지의 최대 인원에 도달했습니다.");
        }

        team.getMembers().add(userToJoin);
        userToJoin.getTeams().add(team); // User 엔티티의 teams 리스트에도 추가 (양방향 관계 관리)
        userRepository.save(userToJoin); // User 엔티티 업데이트
        teamRepository.save(team); // Team 엔티티 업데이트
        return teamChallenge;
    }

    // 팀 경쟁 수정
    @Transactional
    public TeamChallenge updateTeamChallenge(Long teamChallengeId, CreateTeamChallengeRequestDto requestDto) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUserid(currentUserIdStr)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        TeamChallenge teamChallenge = teamChallengeRepository.findById(teamChallengeId)
                .orElseThrow(() -> new IllegalArgumentException("팀 챌린지를 찾을 수 없습니다. ID: " + teamChallengeId));

        // 방장만 수정 가능
        if (!teamChallenge.getLeaderId().equals(currentUser.getId())) {
            throw new SecurityException("팀 챌린지를 수정할 권한이 없습니다.");
        }

        teamChallenge.getTeam().setName(requestDto.getRoomName());
        teamChallenge.setChallengeTitle(requestDto.getChallengeTitle());
        teamChallenge.setChallengeDescription(requestDto.getChallengeDescription());
        teamChallenge.setEndDate(requestDto.getEndDate());
        teamChallenge.setGoalQuantity(requestDto.getGoalQuantity());

        teamRepository.save(teamChallenge.getTeam()); // Team 엔티티 업데이트
        return teamChallengeRepository.save(teamChallenge); // TeamChallenge 엔티티 업데이트
    }

    // 팀 경쟁 삭제
    @Transactional
    public void deleteTeamChallenge(Long teamChallengeId) {
        String currentUserIdStr = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUserid(currentUserIdStr)
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

        TeamChallenge teamChallenge = teamChallengeRepository.findById(teamChallengeId)
                .orElseThrow(() -> new IllegalArgumentException("팀 챌린지를 찾을 수 없습니다. ID: " + teamChallengeId));

        // 방장만 삭제 가능
        if (!teamChallenge.getLeaderId().equals(currentUser.getId())) {
            throw new SecurityException("팀 챌린지를 삭제할 권한이 없습니다.");
        }

        Team team = teamChallenge.getTeam();

        // TeamChallenge 삭제
        teamChallengeRepository.delete(teamChallenge);

        // Team의 멤버들에서 이 Team을 제거 (양방향 관계 관리)
        for (User member : team.getMembers()) {
            member.getTeams().remove(team);
            userRepository.save(member);
        }
        
        // Team 삭제
        teamRepository.delete(team);
    }
}

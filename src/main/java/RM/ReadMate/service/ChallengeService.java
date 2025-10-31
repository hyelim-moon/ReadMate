package RM.ReadMate.service;

import RM.ReadMate.dto.ChallengeDTO;
import RM.ReadMate.entity.Challenge;
import RM.ReadMate.entity.ChallengeParticipation;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.ChallengeParticipationRepository;
import RM.ReadMate.repository.ChallengeRepository;
import RM.ReadMate.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository challengeParticipationRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void initChallenges() {
        if (challengeRepository.count() == 0) {
            Challenge challenge1 = new Challenge();
            challenge1.setTitle("10월 독서 마라톤");
            challenge1.setDescription("10월 한 달 동안 책 5권 읽기");
            challenge1.setReward(500);
            challenge1.setStartDate(LocalDate.of(2024, 10, 1));
            challenge1.setEndDate(LocalDate.of(2024, 10, 31));
            challengeRepository.save(challenge1);

            Challenge challenge2 = new Challenge();
            challenge2.setTitle("주말 독서 챌린지");
            challenge2.setDescription("주말 동안 300페이지 이상 읽기");
            challenge2.setReward(100);
            challenge2.setStartDate(LocalDate.now().minusDays(1));
            challenge2.setEndDate(LocalDate.now().plusDays(1));
            challengeRepository.save(challenge2);
        }
    }

    public List<ChallengeDTO> getChallenges() {
        List<Challenge> challenges = challengeRepository.findAll();
        return challenges.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ChallengeDTO convertToDto(Challenge challenge) {
        String status = getStatus(challenge);
        long participants = challengeParticipationRepository.countByChallenge(challenge);
        return new ChallengeDTO(challenge, status, participants);
    }

    private String getStatus(Challenge challenge) {
        LocalDate now = LocalDate.now();
        if (now.isBefore(challenge.getStartDate())) {
            return "예정";
        } else if (now.isAfter(challenge.getEndDate())) {
            return "종료";
        } else {
            return "진행중";
        }
    }

    @Transactional
    public void participateInChallenge(Long challengeId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Challenge challenge = challengeRepository.findById(challengeId).orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challengeParticipationRepository.findByUserAndChallenge(user, challenge).isPresent()) {
            throw new RuntimeException("Already participating in the challenge");
        }

        ChallengeParticipation participation = new ChallengeParticipation();
        participation.setUser(user);
        participation.setChallenge(challenge);
        participation.setParticipationDate(LocalDate.now());

        // Add to collections for in-memory consistency
        challenge.getParticipations().add(participation);
        user.getChallengeParticipations().add(participation);

        user.addPoints(challenge.getReward()); // Update user's points

        // Save only the owning side of the ManyToOne relationship
        challengeParticipationRepository.save(participation);
        // The changes to 'user' (points and collection) and 'challenge' (collection)
        // will be flushed automatically at the end of the @Transactional method
        // because they are managed entities and their collections have CascadeType.ALL.
    }

    @Transactional(readOnly = true)
    public List<ChallengeDTO> getMyChallengeProgress(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getChallengeParticipations().stream()
                .map(participation -> {
                    Challenge challenge = participation.getChallenge();
                    // TODO: 실제 진행 상황에 따라 status를 더 세분화해야 할 수 있습니다.
                    // 현재는 일반 챌린지 상태 로직을 따릅니다.
                    String status = getStatus(challenge);
                    long participants = challengeParticipationRepository.countByChallenge(challenge);
                    return new ChallengeDTO(challenge, status, participants);
                })
                .collect(Collectors.toList());
    }
}

package RM.ReadMate.service;

import RM.ReadMate.dto.ChallengeDTO;
import RM.ReadMate.entity.Challenge;
import RM.ReadMate.entity.ChallengeParticipation;
import RM.ReadMate.entity.Record; // Record import 추가
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.ChallengeParticipationRepository;
import RM.ReadMate.repository.ChallengeRepository;
import RM.ReadMate.repository.RecordRepository;
import RM.ReadMate.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Set; // Set import 추가
import java.util.HashSet; // HashSet import 추가

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository challengeParticipationRepository;
    private final UserRepository userRepository;
    private final RecordRepository recordRepository; // RecordRepository 주입
    private final UserService userService; // UserService 주입

    @PostConstruct
    @Transactional
    public void initChallenges() {
        // 챌린지 1: 없으면 만들고, 있으면 정보 업데이트
        Challenge challenge1 = challengeRepository.findByTitle("10월 독서 마라톤").orElse(new Challenge());
        challenge1.setTitle("10월 독서 마라톤");
        challenge1.setDescription("10월 한 달 동안 책 5권 읽기");
        challenge1.setReward(500);
        challenge1.setStartDate(LocalDate.of(2024, 10, 1));
        challenge1.setEndDate(LocalDate.of(2024, 10, 31));
        challengeRepository.save(challenge1);

        // 챌린지 2: 없으면 만들고, 있으면 정보 업데이트
        Challenge challenge2 = challengeRepository.findByTitle("주말 독서 챌린지").orElse(new Challenge());
        challenge2.setTitle("주말 독서 챌린지");
        challenge2.setDescription("주말 동안 독서 기록 1개 남기기"); // 목표 변경
        challenge2.setReward(100);
        challenge2.setStartDate(LocalDate.now().minusDays(1));
        challenge2.setEndDate(LocalDate.now().plusDays(1));
        challengeRepository.save(challenge2);

        // 챌린지 3: 없으면 만들고, 있으면 정보 업데이트
        Challenge challenge3 = challengeRepository.findByTitle("연말 독서 챌린지").orElse(new Challenge());
        challenge3.setTitle("연말 독서 챌린지");
        challenge3.setDescription("12월 한 달 동안 책 3권 읽기");
        challenge3.setReward(300);
        challenge3.setStartDate(LocalDate.of(2025, 12, 1));
        challenge3.setEndDate(LocalDate.of(2025, 12, 31));
        challengeRepository.save(challenge3);

        // 챌린지 4 (새로 추가): 다독왕 챌린지
        Challenge challenge4 = challengeRepository.findByTitle("다독왕 챌린지").orElse(new Challenge());
        challenge4.setTitle("다독왕 챌린지");
        challenge4.setDescription("일주일 동안 3권 이상 읽기");
        challenge4.setReward(200);
        challenge4.setStartDate(LocalDate.now().minusDays(3));
        challenge4.setEndDate(LocalDate.now().plusDays(4));
        challengeRepository.save(challenge4);

        // 챌린지 5 (새로 추가): 장르 탐험가 챌린지
        Challenge challenge5 = challengeRepository.findByTitle("장르 탐험가 챌린지").orElse(new Challenge());
        challenge5.setTitle("장르 탐험가 챌린지");
        challenge5.setDescription("2주 동안 서로 다른 장르의 책 2권 읽기");
        challenge5.setReward(150);
        challenge5.setStartDate(LocalDate.now());
        challenge5.setEndDate(LocalDate.now().plusWeeks(2));
        challengeRepository.save(challenge5);
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
        participation.setRewardClaimed(false);
        participation.setCompleted(false);
        participation.setStatus("진행중");

        challenge.getParticipations().add(participation);
        user.getChallengeParticipations().add(participation);

        challengeParticipationRepository.save(participation);
    }

    @Transactional
    public List<ChallengeDTO> getMyChallengeProgress(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        return user.getChallengeParticipations().stream()
                .map(participation -> {
                    Challenge challenge = participation.getChallenge();
                    long participants = challengeParticipationRepository.countByChallenge(challenge);
                    int goal = parseGoal(challenge.getDescription());

                    String status;
                    int currentProgress;

                    if (participation.isCompleted()) {
                        status = participation.getStatus();
                        currentProgress = participation.getFinalProgress();
                    } else {
                        LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                                       participation.getParticipationDate() : challenge.getStartDate();
                        currentProgress = calculateProgress(user, challenge, effectiveStartDate);
                        
                        if (currentProgress >= goal) {
                            status = "달성";
                        } else if (LocalDate.now().isAfter(challenge.getEndDate())) {
                            status = "실패";
                            // 실패 상태를 영구 저장
                            participation.setCompleted(true);
                            participation.setStatus("실패");
                            participation.setFinalProgress(currentProgress);
                            challengeParticipationRepository.save(participation);
                        } else {
                            status = "진행중";
                        }
                    }

                    String relatedLink = "/recordlist";
                    String relatedLinkText = "내 독서 기록 바로가기";

                    return new ChallengeDTO(challenge, status, participants, currentProgress, goal, relatedLink, relatedLinkText, participation.isRewardClaimed());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ChallengeDTO getChallengeDetailsForUser(Long challengeId, Long userId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long participants = challengeParticipationRepository.countByChallenge(challenge);
        int goal = parseGoal(challenge.getDescription());

        ChallengeParticipation participation = challengeParticipationRepository.findByUserAndChallenge(user, challenge)
                .orElse(null);

        String status;
        int currentProgress;
        boolean isRewardClaimed = false;

        if (participation != null) {
            isRewardClaimed = participation.isRewardClaimed();
            if (participation.isCompleted()) {
                status = participation.getStatus();
                currentProgress = participation.getFinalProgress();
            } else {
                LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                               participation.getParticipationDate() : challenge.getStartDate();
                currentProgress = calculateProgress(user, challenge, effectiveStartDate);

                if (currentProgress >= goal) {
                    status = "달성";
                } else if (LocalDate.now().isAfter(challenge.getEndDate())) {
                    status = "실패";
                     // 실패 상태를 영구 저장
                    participation.setCompleted(true);
                    participation.setStatus("실패");
                    participation.setFinalProgress(currentProgress);
                    challengeParticipationRepository.save(participation);
                } else {
                    status = "진행중";
                }
            }
        } else {
            status = getStatus(challenge);
            currentProgress = 0;
        }

        String relatedLink = "/recordlist";
        String relatedLinkText = "내 독서 기록 바로가기";

        return new ChallengeDTO(challenge, status, participants, currentProgress, goal, relatedLink, relatedLinkText, isRewardClaimed);
    }

    @Transactional
    public ChallengeDTO claimChallengeReward(Long challengeId, Long userId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChallengeParticipation participation = challengeParticipationRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new RuntimeException("User has not participated in this challenge."));

        if (participation.isRewardClaimed()) {
            throw new RuntimeException("Reward already claimed for this challenge.");
        }

        LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                       participation.getParticipationDate() : challenge.getStartDate();
        int currentProgress = calculateProgress(user, challenge, effectiveStartDate);
        int goal = parseGoal(challenge.getDescription());

        if (currentProgress < goal) {
            throw new RuntimeException("Challenge goal not met. Current progress: " + currentProgress + ", Goal: " + goal);
        }

        userService.addPoints(userId, challenge.getReward());
        participation.setRewardClaimed(true);
        participation.setCompleted(true);
        participation.setStatus("완료");
        participation.setFinalProgress(currentProgress);
        challengeParticipationRepository.save(participation);

        long participants = challengeParticipationRepository.countByChallenge(challenge);
        String relatedLink = "/recordlist";
        String relatedLinkText = "내 독서 기록 바로가기";

        return new ChallengeDTO(challenge, "완료", participants, currentProgress, goal, relatedLink, relatedLinkText, true);
    }
    
    private int calculateProgress(User user, Challenge challenge, LocalDate startDate) {
        if ("장르 탐험가 챌린지".equals(challenge.getTitle())) {
            List<Record> records = recordRepository.findByUserAndRecordDateBetween(user, startDate, challenge.getEndDate());
            Set<String> uniqueGenres = new HashSet<>();
            for (Record record : records) {
                if (record.getGenre() != null && !record.getGenre().trim().isEmpty()) {
                    uniqueGenres.add(record.getGenre().trim());
                }
            }
            return uniqueGenres.size();
        } else {
            return recordRepository.countByUserAndRecordDateBetween(user, startDate, challenge.getEndDate());
        }
    }

    private int parseGoal(String description) {
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(description);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group());
            } catch (NumberFormatException e) {
                return 1;
            }
        }
        return 1;
    }

    @Transactional
    public void abandonChallenge(Long challengeId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeParticipation participation = challengeParticipationRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new RuntimeException("User has not participated in this challenge. "));

        if (LocalDate.now().isAfter(challenge.getEndDate())) {
            throw new RuntimeException("Cannot abandon a challenge that has already ended.");
        }

        challengeParticipationRepository.delete(participation);
    }
}

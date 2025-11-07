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
        participation.setRewardClaimed(false); // 보상 수령 여부 초기화

        // Add to collections for in-memory consistency
        challenge.getParticipations().add(participation);
        user.getChallengeParticipations().add(participation);

        // user.addPoints(challenge.getReward()); // 보상은 챌린지 완료 후 수령 시 지급

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
                    String status = getStatus(challenge);
                    long participants = challengeParticipationRepository.countByChallenge(challenge);

                    // 챌린지 참여 날짜와 챌린지 시작일 중 더 늦은 날짜를 독서 기록 집계 시작일로 사용
                    LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                                   participation.getParticipationDate() : challenge.getStartDate();

                    int currentProgress = 0;
                    // "장르 탐험가 챌린지"인 경우 고유 장르 수를 세고, 그 외에는 독서 기록 수를 셉니다.
                    if ("장르 탐험가 챌린지".equals(challenge.getTitle())) {
                        List<Record> records = recordRepository.findByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
                        Set<String> uniqueGenres = new HashSet<>();
                        for (Record record : records) {
                            if (record.getGenre() != null && !record.getGenre().trim().isEmpty()) {
                                uniqueGenres.add(record.getGenre().trim());
                            }
                        }
                        currentProgress = uniqueGenres.size();
                    } else {
                        currentProgress = recordRepository.countByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
                    }

                    int goal = 0;
                    Pattern pattern = Pattern.compile("\\d+");
                    Matcher matcher = pattern.matcher(challenge.getDescription());
                    if (matcher.find()) {
                        try {
                            goal = Integer.parseInt(matcher.group());
                        } catch (NumberFormatException e) {
                            goal = 1;
                        }
                    }

                    String relatedLink = "/recordlist"; // 기본값: 내 독서 기록 바로가기
                    String relatedLinkText = "내 독서 기록 바로가기";

                    // ChallengeDTO에 isRewardClaimed 필드 추가
                    return new ChallengeDTO(challenge, status, participants, currentProgress, goal, relatedLink, relatedLinkText, participation.isRewardClaimed());
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChallengeDTO getChallengeDetailsForUser(Long challengeId, Long userId) {
        System.out.println("\n--- Debugging Challenge Progress ---");
        System.out.println("Challenge ID: " + challengeId + ", User ID: " + userId);

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("Challenge Title: " + challenge.getTitle());
        System.out.println("Challenge Start Date: " + challenge.getStartDate() + ", End Date: " + challenge.getEndDate());

        String status = getStatus(challenge);
        long participants = challengeParticipationRepository.countByChallenge(challenge);

        ChallengeParticipation participation = challengeParticipationRepository.findByUserAndChallenge(user, challenge)
                .orElse(null);

        int currentProgress = 0;
        boolean isRewardClaimed = false; // isRewardClaimed 초기화
        if (participation != null) {
            System.out.println("User participated. Participation Date: " + participation.getParticipationDate());
            LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                           participation.getParticipationDate() : challenge.getStartDate();
            System.out.println("Effective Start Date for records: " + effectiveStartDate);

            if ("장르 탐험가 챌린지".equals(challenge.getTitle())) {
                System.out.println("Calculating progress for '장르 탐험가 챌린지' (unique genres).");
                List<Record> records = recordRepository.findByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
                System.out.println("Found " + records.size() + " records for user in period.");
                Set<String> uniqueGenres = new HashSet<>();
                for (Record record : records) {
                    System.out.println("  Record ID: " + record.getId() + ", Date: " + record.getRecordDate() + ", Genre: " + record.getGenre());
                    if (record.getGenre() != null && !record.getGenre().trim().isEmpty()) {
                        uniqueGenres.add(record.getGenre().trim());
                    } else {
                        System.out.println("  Record ID: " + record.getId() + " has null or empty genre. Skipping.");
                    }
                }
                currentProgress = uniqueGenres.size();
                System.out.println("Unique genres count: " + currentProgress);
            } else {
                currentProgress = recordRepository.countByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
                System.out.println("Calculating progress for other challenge (record count): " + currentProgress);
            }
            isRewardClaimed = participation.isRewardClaimed(); // 참여 정보에서 보상 수령 여부 가져옴
        } else {
            System.out.println("User has not participated in this challenge.");
        }

        int goal = 0;
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(challenge.getDescription());
        if (matcher.find()) {
            try {
                goal = Integer.parseInt(matcher.group());
            } catch (NumberFormatException e) {
                goal = 1;
            }
        }
        System.out.println("Calculated Goal: " + goal);
        System.out.println("--- End Debugging Challenge Progress ---\n");

        String relatedLink = "/recordlist"; // 기본값: 내 독서 기록 바로가기
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

        // 챌린지가 종료되었는지 확인
        if (LocalDate.now().isBefore(challenge.getEndDate())) {
            throw new RuntimeException("Challenge has not ended yet.");
        }

        // 이미 보상을 수령했는지 확인
        if (participation.isRewardClaimed()) {
            throw new RuntimeException("Reward already claimed for this challenge.");
        }

        // 챌린지 목표 달성 여부 확인 (currentProgress 재계산)
        LocalDate effectiveStartDate = participation.getParticipationDate().isAfter(challenge.getStartDate()) ?
                                       participation.getParticipationDate() : challenge.getStartDate();

        int currentProgress = 0;
        if ("장르 탐험가 챌린지".equals(challenge.getTitle())) {
            List<Record> records = recordRepository.findByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
            Set<String> uniqueGenres = new HashSet<>();
            for (Record record : records) {
                if (record.getGenre() != null && !record.getGenre().trim().isEmpty()) {
                    uniqueGenres.add(record.getGenre().trim());
                }
            }
            currentProgress = uniqueGenres.size();
        } else {
            currentProgress = recordRepository.countByUserAndRecordDateBetween(user, effectiveStartDate, challenge.getEndDate());
        }

        int goal = 0;
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(challenge.getDescription());
        if (matcher.find()) {
            try {
                goal = Integer.parseInt(matcher.group());
            } catch (NumberFormatException e) {
                goal = 1;
            }
        }

        if (currentProgress < goal) {
            throw new RuntimeException("Challenge goal not met. Current progress: " + currentProgress + ", Goal: " + goal);
        }

        // 보상 지급
        userService.addPoints(userId, challenge.getReward());
        participation.setRewardClaimed(true);
        challengeParticipationRepository.save(participation);

        // 업데이트된 ChallengeDTO 반환
        String status = getStatus(challenge);
        long participants = challengeParticipationRepository.countByChallenge(challenge);
        String relatedLink = "/recordlist";
        String relatedLinkText = "내 독서 기록 바로가기";

        return new ChallengeDTO(challenge, status, participants, currentProgress, goal, relatedLink, relatedLinkText, true);
    }

    @Transactional
    public void abandonChallenge(Long challengeId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        ChallengeParticipation participation = challengeParticipationRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new RuntimeException("User has not participated in this challenge. "));

        // 챌린지가 이미 종료되었으면 포기할 수 없음
        if (LocalDate.now().isAfter(challenge.getEndDate())) {
            throw new RuntimeException("Cannot abandon a challenge that has already ended.");
        }

        // 챌린지 참여 기록 삭제
        challengeParticipationRepository.delete(participation);
    }
}

package RM.ReadMate.service;

import RM.ReadMate.dto.FriendshipResponseDto;
import RM.ReadMate.entity.Friendship;
import RM.ReadMate.entity.FriendshipStatus;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.FriendshipRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    // 친구 요청 보내기
    @Transactional
    public Friendship sendFriendRequest(Long requesterId, Long addresseeId) {
        if (requesterId.equals(addresseeId)) {
            throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("요청자를 찾을 수 없습니다. ID: " + requesterId));
        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new IllegalArgumentException("수신자를 찾을 수 없습니다. ID: " + addresseeId));

        // 이미 친구 관계이거나 요청이 존재하는지 확인
        Optional<Friendship> existingFriendship = friendshipRepository.findExistingFriendship(requester, addressee);

        if (existingFriendship.isPresent()) {
            Friendship friendship = existingFriendship.get();
            if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new IllegalStateException("이미 친구입니다.");
            } else if (friendship.getStatus() == FriendshipStatus.PENDING) {
                if (friendship.getRequester().equals(requester)) {
                    throw new IllegalStateException("이미 친구 요청을 보냈습니다.");
                } else {
                    throw new IllegalStateException("이미 친구 요청을 받았습니다. 수락 또는 거절해주세요.");
                }
            }
            else if (friendship.getStatus() == FriendshipStatus.REJECTED) {
                // 거절된 요청이 있다면 삭제하고 새로 보낼 수 있도록 허용 (정책에 따라 변경 가능)
                friendshipRepository.delete(friendship);
            }
        }

        Friendship friendship = new Friendship(requester, addressee, FriendshipStatus.PENDING);
        return friendshipRepository.save(friendship);
    }

    // 친구 요청 수락
    @Transactional
    public Friendship acceptFriendRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 요청을 찾을 수 없습니다. ID: " + friendshipId));

        if (!friendship.getAddressee().getId().equals(userId)) {
            throw new SecurityException("친구 요청을 수락할 권한이 없습니다.");
        }
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("대기 중인 친구 요청이 아닙니다.");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    // 친구 요청 거절
    @Transactional
    public Friendship rejectFriendRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 요청을 찾을 수 없습니다. ID: " + friendshipId));

        if (!friendship.getAddressee().getId().equals(userId) && !friendship.getRequester().getId().equals(userId)) {
            throw new SecurityException("친구 요청을 거절/취소할 권한이 없습니다.");
        }
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("대기 중인 친구 요청이 아닙니다.");
        }

        // 요청을 보낸 사람이 취소하는 경우와 받은 사람이 거절하는 경우 모두 REJECTED로 처리
        friendship.setStatus(FriendshipStatus.REJECTED);
        return friendshipRepository.save(friendship);
    }

    // 친구 삭제
    @Transactional
    public void deleteFriend(Long currentUserId, Long targetFriendId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("현재 사용자를 찾을 수 없습니다. ID: " + currentUserId));
        User targetFriend = userRepository.findById(targetFriendId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 친구를 찾을 수 없습니다. ID: " + targetFriendId));

        Optional<Friendship> friendshipOptional = friendshipRepository.findAcceptedFriendship(currentUser, targetFriend);

        if (friendshipOptional.isEmpty()) {
            throw new IllegalArgumentException("친구 관계를 찾을 수 없거나 이미 삭제되었습니다.");
        }

        friendshipRepository.delete(friendshipOptional.get());
    }

    // 특정 사용자의 친구 목록 조회
    public List<FriendshipResponseDto> getFriendsList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        List<Friendship> friendships = friendshipRepository.findAllAcceptedFriendshipsByUser(user);

        return friendships.stream()
                .map(f -> {
                    User friendUser = f.getRequester().equals(user) ? f.getAddressee() : f.getRequester();
                    return new FriendshipResponseDto(f.getId(), friendUser.getId(), friendUser.getNickname(), friendUser.getProfileImageUrl());
                })
                .collect(Collectors.toList());
    }

    // 특정 사용자가 받은 보류 중인 친구 요청 목록 조회
    public List<Friendship> getPendingRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        return friendshipRepository.findByAddresseeAndStatus(user, FriendshipStatus.PENDING);
    }

    // 특정 사용자가 보낸 보류 중인 친구 요청 목록 조회
    public List<Friendship> getSentRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        return friendshipRepository.findByRequesterAndStatus(user, FriendshipStatus.PENDING);
    }

    // 추천 친구 목록 조회
    public List<FriendshipResponseDto> getRecommendedFriends(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + userId));

        // 1. 모든 활성화된 사용자 조회
        List<User> allEnabledUsers = userRepository.findAll().stream()
                .filter(User::isEnabled) // enabled 필드가 true인 사용자만 필터링
                .collect(Collectors.toList());

        // 2. 현재 사용자와 관련된 모든 친구 관계 (요청, 친구, 거절 등 모든 상태) 조회
        List<Friendship> relatedFriendships = friendshipRepository.findByRequesterOrAddressee(currentUser);

        // 3. 현재 사용자와 이미 관계가 있는 사용자들의 ID를 Set으로 수집
        Set<Long> relatedUserIds = relatedFriendships.stream()
                .flatMap(f -> Stream.of(f.getRequester().getId(), f.getAddressee().getId()))
                .filter(id -> !id.equals(userId)) // 현재 사용자 자신은 제외
                .collect(Collectors.toSet());

        // 4. 모든 활성화된 사용자 중에서 현재 사용자 자신과 이미 관계가 있는 사용자를 제외하고 추천 가능한 친구 목록 생성
        List<User> potentialFriends = allEnabledUsers.stream()
                .filter(user -> !user.getId().equals(userId) && !relatedUserIds.contains(user.getId()))
                .collect(Collectors.toList());

        // 5. 추천 가능한 친구 목록을 랜덤으로 섞기
        Collections.shuffle(potentialFriends);

        // 6. 상위 N개 (예: 5개)만 반환
        int numberOfRecommendations = 5; // 예시로 5개
        return potentialFriends.stream()
                .limit(numberOfRecommendations)
                .map(user -> new FriendshipResponseDto(null, user.getId(), user.getNickname(), user.getProfileImageUrl()))
                .collect(Collectors.toList());
    }
}

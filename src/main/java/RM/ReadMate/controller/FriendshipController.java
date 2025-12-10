package RM.ReadMate.controller;

import RM.ReadMate.dto.FriendRequestDto;
import RM.ReadMate.dto.FriendshipResponseDto;
import RM.ReadMate.entity.Friendship;
import RM.ReadMate.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    // 친구 목록 조회
    @GetMapping("/{userId}")
    public ResponseEntity<List<FriendshipResponseDto>> getFriendsList(@PathVariable Long userId) {
        List<FriendshipResponseDto> friends = friendshipService.getFriendsList(userId);
        return ResponseEntity.ok(friends);
    }

    // 추천 친구 목록 조회
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<FriendshipResponseDto>> getRecommendedFriends(@PathVariable Long userId) {
        List<FriendshipResponseDto> recommendedFriends = friendshipService.getRecommendedFriends(userId);
        return ResponseEntity.ok(recommendedFriends);
    }

    // 친구 요청 보내기
    @PostMapping("/request/{requesterId}")
    public ResponseEntity<String> sendFriendRequest(
            @PathVariable Long requesterId,
            @RequestBody FriendRequestDto requestDto) {
        try {
            friendshipService.sendFriendRequest(requesterId, requestDto.getAddresseeId());
            return ResponseEntity.status(HttpStatus.CREATED).body("친구 요청을 성공적으로 보냈습니다.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 요청 중 오류가 발생했습니다.");
        }
    }

    // 친구 요청 수락
    @PutMapping("/accept/{friendshipId}/{userId}")
    public ResponseEntity<String> acceptFriendRequest(
            @PathVariable Long friendshipId,
            @PathVariable Long userId) {
        try {
            friendshipService.acceptFriendRequest(friendshipId, userId);
            return ResponseEntity.ok("친구 요청을 수락했습니다.");
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 요청 수락 중 오류가 발생했습니다.");
        }
    }

    // 친구 요청 거절
    @PutMapping("/reject/{friendshipId}/{userId}")
    public ResponseEntity<String> rejectFriendRequest(
            @PathVariable Long friendshipId,
            @PathVariable Long userId) {
        try {
            friendshipService.rejectFriendRequest(friendshipId, userId);
            return ResponseEntity.ok("친구 요청을 거절했습니다.");
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 요청 거절 중 오류가 발생했습니다.");
        }
    }

    // 친구 삭제
    @DeleteMapping("/{currentUserId}/{targetFriendId}")
    public ResponseEntity<String> deleteFriend(
            @PathVariable Long currentUserId,
            @PathVariable Long targetFriendId) {
        try {
            friendshipService.deleteFriend(currentUserId, targetFriendId);
            return ResponseEntity.ok("친구 관계가 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("친구 삭제 중 오류가 발생했습니다.");
        }
    }

    // 특정 사용자가 받은 보류 중인 친구 요청 목록 조회
    @GetMapping("/pending-requests/{userId}")
    public ResponseEntity<List<FriendshipResponseDto>> getPendingFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingRequests(userId);
        List<FriendshipResponseDto> response = pendingRequests.stream()
                .map(f -> new FriendshipResponseDto(f.getId(), f.getRequester().getId(), f.getRequester().getNickname(), f.getRequester().getProfileImageUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // 특정 사용자가 보낸 보류 중인 친구 요청 목록 조회
    @GetMapping("/sent-requests/{userId}")
    public ResponseEntity<List<FriendshipResponseDto>> getSentFriendRequests(@PathVariable Long userId) {
        List<Friendship> sentRequests = friendshipService.getSentRequests(userId);
        List<FriendshipResponseDto> response = sentRequests.stream()
                .map(f -> new FriendshipResponseDto(f.getId(), f.getAddressee().getId(), f.getAddressee().getNickname(), f.getAddressee().getProfileImageUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}

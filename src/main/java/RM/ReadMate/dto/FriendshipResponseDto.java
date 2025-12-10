package RM.ReadMate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipResponseDto {
    private Long friendshipId; // Friendship 엔티티의 ID 추가
    private Long id; // 친구 또는 요청자의 사용자 ID
    private String nickname;
    private String profileImageUrl; // 프로필 이미지 URL 필드 추가

    // 기존 친구 목록 조회 시 사용될 생성자 (friendshipId 없이)
    public FriendshipResponseDto(Long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }

    // 프로필 이미지 URL을 포함하는 생성자 추가
    public FriendshipResponseDto(Long id, String nickname, String profileImageUrl) {
        this.id = id;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
    }
}

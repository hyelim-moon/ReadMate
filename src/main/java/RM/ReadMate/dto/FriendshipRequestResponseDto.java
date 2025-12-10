package RM.ReadMate.dto;

import RM.ReadMate.entity.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipRequestResponseDto {
    private Long id; // Friendship ID
    private Long senderId;
    private String senderNickname;
    private Long receiverId;
    private String receiverNickname;
    private FriendshipStatus status;
}

package RM.ReadMate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressDto {
    private Long challengeId;
    private String challengeTitle;
    private int recordsCount;
}

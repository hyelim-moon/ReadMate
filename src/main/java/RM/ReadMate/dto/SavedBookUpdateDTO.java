package RM.ReadMate.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SavedBookUpdateDTO {
    private int currentPage;
    private LocalDate startedAt;
    private LocalDate finishedAt;
    private Integer score;
    private Integer wishScore;
}

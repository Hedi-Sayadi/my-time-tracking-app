package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
public class MemberContributionDto {

    private Long userId;
    private String username;
    private Long totalDurationSeconds;
    private Integer taskCount;
    private Instant joinedAt;

}

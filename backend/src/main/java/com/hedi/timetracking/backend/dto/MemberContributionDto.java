package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MemberContributionDto {

  private Long userId;
  private String username;
  private Long totalDurationSeconds;
  private Integer taskCount;
  private Instant joinedAt;
}

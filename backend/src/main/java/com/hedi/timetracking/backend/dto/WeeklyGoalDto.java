package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WeeklyGoalDto {

  private Integer targetHours;
  private Long spentSeconds;
  private Double progressPercent;
  private String weekStart;
  private String weekEnd;
}

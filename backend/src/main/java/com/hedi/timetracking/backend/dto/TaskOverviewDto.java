package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskOverviewDto {

  private String period;
  private long totalDurationSeconds;
  private List<TaskDto> tasks;
  private Instant from;
  private Instant to;
}

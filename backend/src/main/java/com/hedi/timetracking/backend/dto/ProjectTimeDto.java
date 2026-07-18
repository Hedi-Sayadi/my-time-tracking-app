package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectTimeDto {

  private Long projectId;
  private String projectName;
  private long totalDurationSeconds;
  private long taskCount;
}

package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import java.util.Set;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskDto {

  private Long id;
  private String description;
  private Instant startTime;
  private Instant endTime;
  private Boolean running;
  private Long durationSeconds;
  private Set<ProjectDto> projects;
  private Long userId;
  private String username;
  private Instant createdAt;
  private Instant updatedAt;
}

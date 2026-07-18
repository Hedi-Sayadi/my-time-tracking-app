package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Set;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskRequest {

  @NotBlank private String description;

  @NotNull private Instant startTime;

  private Instant endTime;

  private Set<Long> projectIds;
}

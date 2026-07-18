package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import lombok.Data;

@Data
public class StartTaskRequest {

  @NotBlank private String description;

  private Set<Long> projectIds;
}

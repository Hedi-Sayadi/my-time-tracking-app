package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectBudgetDto {

  private Long projectId;
  private String projectName;
  private Integer budgetHours;
  private Long spentSeconds;
}

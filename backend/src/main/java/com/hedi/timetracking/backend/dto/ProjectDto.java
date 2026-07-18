package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectDto {

  private Long id;
  private String name;
  private String description;
  private Long parentId;
  private List<ProjectDto> subprojects;
  private Long ownerId;
  private String ownerUsername;
  private List<ProjectMemberDto> members;
  private Integer budgetHours;
  private Long spentSeconds;
  private Instant createdAt;
}

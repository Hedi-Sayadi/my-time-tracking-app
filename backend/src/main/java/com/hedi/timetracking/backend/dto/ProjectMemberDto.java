package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProjectMemberDto {

  private Long id;
  private Long userId;
  private String username;
  private Instant joinedAt;
}

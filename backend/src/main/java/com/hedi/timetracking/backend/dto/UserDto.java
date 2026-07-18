package com.hedi.timetracking.backend.dto;

import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDto {

  private Long id;
  private String username;
  private String email;
  private String timezone;
  private Integer weeklyTargetHours;
  private Instant createdAt;
}

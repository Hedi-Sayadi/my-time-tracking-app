package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ShareProjectRequest {

  @NotBlank(message = "Username is required")
  private String username;
}

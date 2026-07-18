package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChangePasswordRequest {

  @NotBlank private String oldPassword;

  @NotBlank
  @Size(min = 6, max = 100)
  private String newPassword;
}

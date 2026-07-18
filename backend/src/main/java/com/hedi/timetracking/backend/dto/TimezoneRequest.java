package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TimezoneRequest {

  @NotBlank(message = "Timezone is required")
  private String timezone;
}

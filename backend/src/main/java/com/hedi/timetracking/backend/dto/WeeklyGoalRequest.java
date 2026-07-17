package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WeeklyGoalRequest {

    @Min(0)
    private Integer targetHours;

}

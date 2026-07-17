package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
public class TaskOverviewDto {

    private String period;
    private long totalDurationSeconds;
    private List<TaskDto> tasks;
    private Instant from;
    private Instant to;

}

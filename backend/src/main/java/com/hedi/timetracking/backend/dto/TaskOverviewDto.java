package com.hedi.timetracking.backend.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class TaskOverviewDto {

    private String period;
    private long totalDurationSeconds;
    private List<TaskDto> tasks;
    private Instant from;
    private Instant to;

}

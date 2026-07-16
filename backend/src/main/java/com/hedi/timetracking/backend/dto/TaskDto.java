package com.hedi.timetracking.backend.dto;

import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class TaskDto {

    private Long id;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private Boolean running;
    private Long durationSeconds;
    private Set<ProjectDto> projects;
    private Instant createdAt;
    private Instant updatedAt;

}

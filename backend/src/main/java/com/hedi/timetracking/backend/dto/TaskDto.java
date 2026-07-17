package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
public class TaskDto {

    private Long id;
    private String description;
    private Instant startTime;
    private Instant endTime;
    private Boolean running;
    private Long durationSeconds;
    private Set<ProjectDto> projects;
    private Long userId;
    private String username;
    private Instant createdAt;
    private Instant updatedAt;

}

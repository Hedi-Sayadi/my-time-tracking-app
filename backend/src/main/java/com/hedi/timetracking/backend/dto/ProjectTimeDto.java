package com.hedi.timetracking.backend.dto;

import lombok.Data;

@Data
public class ProjectTimeDto {

    private Long projectId;
    private String projectName;
    private long totalDurationSeconds;
    private long taskCount;

}

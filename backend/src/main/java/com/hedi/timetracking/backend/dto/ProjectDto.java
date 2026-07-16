package com.hedi.timetracking.backend.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ProjectDto {

    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private List<ProjectDto> subprojects;
    private Instant createdAt;

}

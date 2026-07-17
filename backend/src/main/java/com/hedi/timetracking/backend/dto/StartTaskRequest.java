package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class StartTaskRequest {

    @NotBlank
    private String description;

    private Set<Long> projectIds;

}

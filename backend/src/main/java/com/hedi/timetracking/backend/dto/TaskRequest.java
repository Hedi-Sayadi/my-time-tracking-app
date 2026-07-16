package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class TaskRequest {

    @NotBlank
    private String description;

    @NotNull
    private Instant startTime;

    private Instant endTime;

    private Set<Long> projectIds;

}

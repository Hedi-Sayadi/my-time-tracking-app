package com.hedi.timetracking.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    private Long parentId;

}

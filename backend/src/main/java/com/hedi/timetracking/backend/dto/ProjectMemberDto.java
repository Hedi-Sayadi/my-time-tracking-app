package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
public class ProjectMemberDto {

    private Long id;
    private Long userId;
    private String username;
    private Instant joinedAt;

}

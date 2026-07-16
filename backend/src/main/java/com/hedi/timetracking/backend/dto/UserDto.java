package com.hedi.timetracking.backend.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private Instant createdAt;

}

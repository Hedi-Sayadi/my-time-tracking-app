package com.hedi.timetracking.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private Instant createdAt;

}

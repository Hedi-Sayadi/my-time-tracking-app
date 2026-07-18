package com.hedi.timetracking.backend.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class TaskTest {

  @Test
  void getDurationSeconds_withEndTime_returnsCorrectDuration() {
    Instant start = Instant.parse("2024-01-01T10:00:00Z");
    Instant end = Instant.parse("2024-01-01T12:30:00Z");

    Task task =
        Task.builder()
            .description("Test task")
            .startTime(start)
            .endTime(end)
            .running(false)
            .build();

    assertThat(task.getDurationSeconds()).isEqualTo(9000);
  }

  @Test
  void getDurationSeconds_withoutEndTime_usesNow() {
    Instant start = Instant.now().minusSeconds(120);

    Task task = Task.builder().description("Running task").startTime(start).running(true).build();

    assertThat(task.getDurationSeconds()).isGreaterThanOrEqualTo(120);
  }

  @Test
  void getDurationSeconds_withoutStartTime_returnsZero() {
    Task task = Task.builder().description("Empty task").build();

    assertThat(task.getDurationSeconds()).isZero();
  }
}

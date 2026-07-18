package com.hedi.timetracking.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 500)
  private String description;

  @Column(nullable = false, name = "start_time")
  private Instant startTime;

  @Column(name = "end_time")
  private Instant endTime;

  @Column(nullable = false)
  @Builder.Default
  private Boolean running = false;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @OneToMany(
      mappedBy = "task",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  @Builder.Default
  private Set<TaskProject> taskProjects = new HashSet<>();

  @CreationTimestamp
  @Column(nullable = false, updatable = false, name = "created_at")
  private Instant createdAt;

  @UpdateTimestamp
  @Column(nullable = false, name = "updated_at")
  private Instant updatedAt;

  public long getDurationSeconds() {
    if (startTime == null) {
      return 0;
    }
    Instant end = endTime != null ? endTime : Instant.now();
    return end.getEpochSecond() - startTime.getEpochSecond();
  }
}

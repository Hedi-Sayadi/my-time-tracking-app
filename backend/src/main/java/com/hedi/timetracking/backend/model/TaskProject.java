package com.hedi.timetracking.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "task_projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

}

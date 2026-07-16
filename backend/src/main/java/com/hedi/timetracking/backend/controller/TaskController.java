package com.hedi.timetracking.backend.controller;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping("/active")
    public ResponseEntity<TaskDto> getActiveTask() {
        TaskDto active = taskService.getActiveTask();
        return active != null ? ResponseEntity.ok(active) : ResponseEntity.noContent().build();
    }

    @PostMapping("/start")
    public ResponseEntity<TaskDto> startTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.startTask(request));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<TaskDto> stopTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.stopTask(id));
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/overview")
    public ResponseEntity<TaskOverviewDto> getOverview(@RequestParam(defaultValue = "today") String period) {
        return ResponseEntity.ok(taskService.getOverview(period));
    }

    @GetMapping("/projects/{projectId}/time")
    public ResponseEntity<ProjectTimeDto> getProjectTime(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return ResponseEntity.ok(taskService.getProjectTime(projectId, from, to));
    }

}

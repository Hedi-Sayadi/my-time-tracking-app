package com.hedi.timetracking.backend.controller;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<TaskDto> startTask(@Valid @RequestBody StartTaskRequest request) {
        return ResponseEntity.ok(taskService.startTask(request));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<TaskDto> stopTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.stopTask(id));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<TaskDto> resumeTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.resumeTask(id));
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
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(taskService.getProjectTime(projectId, from, to, userId));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDto>> getProjectTasks(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(taskService.getProjectTasks(projectId, from, to, userId));
    }

    @GetMapping("/projects/{projectId}/export")
    public ResponseEntity<String> exportProjectTasks(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        List<TaskDto> tasks = taskService.exportProjectTasks(projectId, from, to);

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Description,Start Time,End Time,Duration (seconds),Projects,User,Running\n");

        for (TaskDto task : tasks) {
            String projects = task.getProjects().stream()
                    .map(ProjectDto::getName)
                    .collect(Collectors.joining("; "));
            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",%b\n",
                    task.getId(),
                    escapeCsv(task.getDescription()),
                    task.getStartTime(),
                    task.getEndTime() != null ? task.getEndTime() : "",
                    task.getDurationSeconds(),
                    escapeCsv(projects),
                    escapeCsv(task.getUsername()),
                    task.getRunning()));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "project-tasks.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.toString());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }

}

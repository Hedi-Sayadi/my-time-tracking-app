package com.hedi.timetracking.backend.service;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.exception.UnauthorizedException;
import com.hedi.timetracking.backend.model.*;
import com.hedi.timetracking.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskProjectRepository taskProjectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskDto> getAllTasks() {
        Long userId = getCurrentUserId();
        return taskRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(Long id) {
        Long userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        return mapToDto(task);
    }

    @Transactional(readOnly = true)
    public TaskDto getActiveTask() {
        Long userId = getCurrentUserId();
        return taskRepository.findByUserIdAndRunningTrue(userId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional
    public TaskDto startTask(StartTaskRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Stop any currently running task
        taskRepository.findByUserIdAndRunningTrue(userId).ifPresent(active -> {
            active.setRunning(false);
            active.setEndTime(Instant.now());
            taskRepository.save(active);
        });

        Task task = Task.builder()
                .description(request.getDescription())
                .startTime(Instant.now())
                .running(true)
                .user(user)
                .build();

        task = taskRepository.save(task);
        linkProjects(task, request.getProjectIds(), userId);

        return mapToDto(task);
    }

    @Transactional
    public TaskDto stopTask(Long id) {
        Long userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (!Boolean.TRUE.equals(task.getRunning())) {
            throw new IllegalStateException("Task is not running");
        }

        task.setRunning(false);
        task.setEndTime(Instant.now());
        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto resumeTask(Long id) {
        Long userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (Boolean.TRUE.equals(task.getRunning())) {
            throw new IllegalStateException("Task is already running");
        }

        task.setRunning(true);
        task.setEndTime(null);
        task = taskRepository.save(task);
        return mapToDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = Task.builder()
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .running(false)
                .user(user)
                .build();

        task = taskRepository.save(task);
        linkProjects(task, request.getProjectIds(), userId);

        return mapToDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskRequest request) {
        Long userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setDescription(request.getDescription());
        task.setStartTime(request.getStartTime());
        task.setEndTime(request.getEndTime());

        // Update running state based on endTime
        task.setRunning(request.getEndTime() == null);

        task = taskRepository.save(task);

        // Re-link projects
        taskProjectRepository.deleteByTaskId(task.getId());
        linkProjects(task, request.getProjectIds(), userId);

        return mapToDto(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Long userId = getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public TaskOverviewDto getOverview(String period) {
        Long userId = getCurrentUserId();
        Instant from;
        Instant to = Instant.now();

        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);

        switch (period.toLowerCase()) {
            case "week" -> {
                LocalDate monday = today.with(DayOfWeek.MONDAY);
                from = monday.atStartOfDay(zone).toInstant();
            }
            case "month" -> {
                LocalDate firstDay = today.withDayOfMonth(1);
                from = firstDay.atStartOfDay(zone).toInstant();
            }
            default -> {
                // today
                from = today.atStartOfDay(zone).toInstant();
            }
        }

        List<Task> tasks = taskRepository.findByUserId(userId).stream()
                .filter(t -> !t.getStartTime().isBefore(from) && !t.getStartTime().isAfter(to))
                .toList();

        long totalSeconds = tasks.stream()
                .mapToLong(Task::getDurationSeconds)
                .sum();

        TaskOverviewDto overview = new TaskOverviewDto();
        overview.setPeriod(period);
        overview.setFrom(from);
        overview.setTo(to);
        overview.setTotalDurationSeconds(totalSeconds);
        overview.setTasks(tasks.stream().map(this::mapToDto).toList());
        return overview;
    }

    @Transactional(readOnly = true)
    public ProjectTimeDto getProjectTime(Long projectId, Instant from, Instant to, Long filterUserId) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findAccessibleById(userId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<Task> taskList;
        if (filterUserId != null) {
            taskList = taskRepository.findByProjectOrSubprojectsAndTimeRangeAndUserId(projectId, filterUserId, from, to);
        } else {
            taskList = taskRepository.findAllByProjectOrSubprojectsAndTimeRange(projectId, from, to);
        }

        Set<Task> tasks = new HashSet<>(taskList);
        long totalSeconds = tasks.stream()
                .mapToLong(Task::getDurationSeconds)
                .sum();

        ProjectTimeDto dto = new ProjectTimeDto();
        dto.setProjectId(project.getId());
        dto.setProjectName(project.getName());
        dto.setTotalDurationSeconds(totalSeconds);
        dto.setTaskCount(tasks.size());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<TaskDto> getProjectTasks(Long projectId, Instant from, Instant to, Long filterUserId) {
        Long userId = getCurrentUserId();
        projectRepository.findAccessibleById(userId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<Task> taskList;
        if (filterUserId != null) {
            taskList = taskRepository.findByProjectOrSubprojectsAndTimeRangeAndUserId(projectId, filterUserId, from, to);
        } else {
            taskList = taskRepository.findAllByProjectOrSubprojectsAndTimeRange(projectId, from, to);
        }

        Set<Task> tasks = new HashSet<>(taskList);
        return tasks.stream()
                .sorted(Comparator.comparing(Task::getStartTime).reversed())
                .map(this::mapToDto)
                .toList();
    }

    private void linkProjects(Task task, Set<Long> projectIds, Long userId) {
        if (projectIds == null || projectIds.isEmpty()) {
            return;
        }
        for (Long projectId : projectIds) {
            Project project = projectRepository.findAccessibleById(userId, projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
            TaskProject tp = TaskProject.builder()
                    .task(task)
                    .project(project)
                    .build();
            taskProjectRepository.save(tp);
        }
    }

    private TaskDto mapToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setDescription(task.getDescription());
        dto.setStartTime(task.getStartTime());
        dto.setEndTime(task.getEndTime());
        dto.setRunning(task.getRunning());
        dto.setDurationSeconds(task.getDurationSeconds());
        dto.setProjects(task.getTaskProjects().stream()
                .map(tp -> {
                    ProjectDto pd = new ProjectDto();
                    pd.setId(tp.getProject().getId());
                    pd.setName(tp.getProject().getName());
                    return pd;
                })
                .collect(Collectors.toSet()));
        dto.setUserId(task.getUser().getId());
        dto.setUsername(task.getUser().getUsername());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"))
                .getId();
    }

}

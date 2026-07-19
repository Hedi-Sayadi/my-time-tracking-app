package com.hedi.timetracking.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.model.*;
import com.hedi.timetracking.backend.repository.ProjectRepository;
import com.hedi.timetracking.backend.repository.TaskProjectRepository;
import com.hedi.timetracking.backend.repository.TaskRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

  @Mock private TaskRepository taskRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private TaskProjectRepository taskProjectRepository;
  @Mock private UserRepository userRepository;

  @InjectMocks private TaskService taskService;

  @BeforeEach
  void setUp() {
    Authentication authentication = mock(Authentication.class);
    when(authentication.getName()).thenReturn("testuser");
    SecurityContext securityContext = mock(SecurityContext.class);
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  private User user() {
    return User.builder().id(1L).username("testuser").build();
  }

  private Project project(Long id, String name) {
    return Project.builder().id(id).name(name).build();
  }

  private Task task(Long id, String description, Instant start, Instant end, Boolean running) {
    return Task.builder()
        .id(id)
        .description(description)
        .startTime(start)
        .endTime(end)
        .running(running)
        .user(user())
        .build();
  }

  private Task taskWithProject(
      Long id, String description, Instant start, Instant end, Boolean running, Project p) {
    Task t = task(id, description, start, end, running);
    TaskProject tp = TaskProject.builder().id(100L).task(t).project(p).build();
    t.setTaskProjects(new HashSet<>(Set.of(tp)));
    return t;
  }

  @Test
  void getAllTasks_shouldReturnDtos() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Task t = task(1L, "T", Instant.now().minusSeconds(100), Instant.now(), false);
    when(taskRepository.findAccessibleByUserId(1L)).thenReturn(List.of(t));

    var result = taskService.getAllTasks();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getDescription()).isEqualTo("T");
  }

  @Test
  void getActiveTask_withRunningTask_shouldReturnDto() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Task t = task(1L, "Active", Instant.now(), null, true);
    when(taskRepository.findByUserIdAndRunningTrue(1L)).thenReturn(Optional.of(t));

    var result = taskService.getActiveTask();

    assertThat(result).isNotNull();
    assertThat(result.getRunning()).isTrue();
  }

  @Test
  void getActiveTask_withoutRunningTask_shouldReturnNull() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByUserIdAndRunningTrue(1L)).thenReturn(Optional.empty());

    var result = taskService.getActiveTask();

    assertThat(result).isNull();
  }

  @Test
  void startTask_shouldStopActiveAndCreateNew() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    Task active =
        Task.builder()
            .id(2L)
            .description("Old")
            .startTime(Instant.now().minusSeconds(300))
            .running(true)
            .user(user)
            .build();
    when(taskRepository.findByUserIdAndRunningTrue(1L)).thenReturn(Optional.of(active));
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(
            inv -> {
              Task arg = inv.getArgument(0);
              if (arg.getId() == null) arg.setId(1L);
              return arg;
            });

    StartTaskRequest req = new StartTaskRequest();
    req.setDescription("New task");

    var result = taskService.startTask(req);

    assertThat(result.getRunning()).isTrue();
    assertThat(result.getDescription()).isEqualTo("New task");
    verify(taskRepository).save(active);
    assertThat(active.getRunning()).isFalse();
    assertThat(active.getEndTime()).isNotNull();
  }

  @Test
  void startTask_withProjects_shouldLink() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(taskRepository.findByUserIdAndRunningTrue(1L)).thenReturn(Optional.empty());
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(
            inv -> {
              Task arg = inv.getArgument(0);
              arg.setId(1L);
              return arg;
            });
    Project p = project(10L, "P");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    when(taskProjectRepository.save(any(TaskProject.class)))
        .thenAnswer(
            inv -> {
              TaskProject tp = inv.getArgument(0);
              tp.getTask().getTaskProjects().add(tp);
              return tp;
            });

    StartTaskRequest req = new StartTaskRequest();
    req.setDescription("Task with project");
    req.setProjectIds(Set.of(10L));

    var result = taskService.startTask(req);

    assertThat(result.getProjects()).hasSize(1);
    verify(taskProjectRepository).save(any(TaskProject.class));
  }

  @Test
  void stopTask_shouldSetEndTimeAndRunningFalse() {
    User user = user();
    Task t =
        Task.builder()
            .id(1L)
            .description("Running")
            .startTime(Instant.now().minusSeconds(300))
            .running(true)
            .user(user)
            .build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

    var result = taskService.stopTask(1L);

    assertThat(result.getRunning()).isFalse();
    assertThat(result.getEndTime()).isNotNull();
  }

  @Test
  void stopTask_notRunning_shouldThrow() {
    User user = user();
    Task t = task(1L, "Done", Instant.now().minusSeconds(300), Instant.now(), false);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));

    assertThatThrownBy(() -> taskService.stopTask(1L))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("not running");
  }

  @Test
  void resumeTask_shouldSetRunningTrue() {
    User user = user();
    Task t = task(1L, "Paused", Instant.now().minusSeconds(300), Instant.now(), false);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

    var result = taskService.resumeTask(1L);

    assertThat(result.getRunning()).isTrue();
    assertThat(result.getEndTime()).isNull();
  }

  @Test
  void resumeTask_alreadyRunning_shouldThrow() {
    User user = user();
    Task t = task(1L, "Running", Instant.now(), null, true);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));

    assertThatThrownBy(() -> taskService.resumeTask(1L))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("already running");
  }

  @Test
  void createTask_shouldReturnDto() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(
            inv -> {
              Task arg = inv.getArgument(0);
              arg.setId(1L);
              return arg;
            });

    TaskRequest req = new TaskRequest();
    req.setDescription("Manual");
    req.setStartTime(Instant.now().minusSeconds(3600));
    req.setEndTime(Instant.now());

    var result = taskService.createTask(req);

    assertThat(result.getRunning()).isFalse();
    assertThat(result.getDescription()).isEqualTo("Manual");
  }

  @Test
  void createTask_withProjects_shouldLink() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(
            inv -> {
              Task arg = inv.getArgument(0);
              arg.setId(1L);
              return arg;
            });
    Project p = project(10L, "P");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    when(taskProjectRepository.save(any(TaskProject.class)))
        .thenAnswer(
            inv -> {
              TaskProject tp = inv.getArgument(0);
              tp.getTask().getTaskProjects().add(tp);
              return tp;
            });

    TaskRequest req = new TaskRequest();
    req.setDescription("Manual with project");
    req.setStartTime(Instant.now().minusSeconds(3600));
    req.setEndTime(Instant.now());
    req.setProjectIds(Set.of(10L));

    var result = taskService.createTask(req);

    assertThat(result.getProjects()).hasSize(1);
  }

  @Test
  void updateTask_shouldUpdateFields() {
    User user = user();
    Task t =
        task(1L, "Old", Instant.now().minusSeconds(1000), Instant.now().minusSeconds(500), false);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

    TaskRequest req = new TaskRequest();
    req.setDescription("Updated");
    req.setStartTime(Instant.now().minusSeconds(200));
    req.setEndTime(null);

    var result = taskService.updateTask(1L, req);

    assertThat(result.getDescription()).isEqualTo("Updated");
    assertThat(result.getRunning()).isTrue();
    verify(taskProjectRepository).deleteByTaskId(1L);
  }

  @Test
  void updateTask_withProjects_shouldRelink() {
    User user = user();
    Task t =
        task(1L, "Old", Instant.now().minusSeconds(1000), Instant.now().minusSeconds(500), false);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));
    Project p = project(10L, "P");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    when(taskProjectRepository.save(any(TaskProject.class)))
        .thenAnswer(
            inv -> {
              TaskProject tp = inv.getArgument(0);
              tp.getTask().getTaskProjects().add(tp);
              return tp;
            });

    TaskRequest req = new TaskRequest();
    req.setDescription("Updated");
    req.setStartTime(Instant.now().minusSeconds(200));
    req.setEndTime(Instant.now());
    req.setProjectIds(Set.of(10L));

    var result = taskService.updateTask(1L, req);

    assertThat(result.getProjects()).hasSize(1);
    verify(taskProjectRepository).deleteByTaskId(1L);
  }

  @Test
  void deleteTask_shouldDelete() {
    User user = user();
    Task t = task(1L, "Delete me", Instant.now().minusSeconds(100), Instant.now(), false);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));

    taskService.deleteTask(1L);

    verify(taskRepository).delete(t);
  }

  @Test
  void deleteTask_notFound_shouldThrow() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.deleteTask(99L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getTask_withWrongId_shouldThrowNotFound() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findAccessibleByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.getTask(99L))
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void getOverview_today_shouldReturnOverview() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Instant now = Instant.now();
    Task t = task(1L, "Today", now.minusSeconds(100), now, false);
    when(taskRepository.findAccessibleByUserIdAndTimeRange(any(), any(), any()))
        .thenReturn(List.of(t));

    var result = taskService.getOverview("today");

    assertThat(result.getPeriod()).isEqualTo("today");
    assertThat(result.getTasks()).hasSize(1);
    assertThat(result.getTotalDurationSeconds()).isEqualTo(100L);
  }

  @Test
  void getOverview_week_shouldReturnOverview() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Task t = task(1L, "Week", Instant.now().minusSeconds(100), Instant.now(), false);
    when(taskRepository.findAccessibleByUserIdAndTimeRange(any(), any(), any()))
        .thenReturn(List.of(t));

    var result = taskService.getOverview("week");

    assertThat(result.getPeriod()).isEqualTo("week");
  }

  @Test
  void getOverview_month_shouldReturnOverview() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Task t = task(1L, "Month", Instant.now().minusSeconds(100), Instant.now(), false);
    when(taskRepository.findAccessibleByUserIdAndTimeRange(any(), any(), any()))
        .thenReturn(List.of(t));

    var result = taskService.getOverview("month");

    assertThat(result.getPeriod()).isEqualTo("month");
  }

  @Test
  void getProjectTime_withoutFilter_shouldReturnDto() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Project p = project(10L, "Project");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    Task t = taskWithProject(1L, "T", from.plusSeconds(100), to.minusSeconds(100), false, p);
    when(taskRepository.findAllByProjectOrSubprojectsAndTimeRange(10L, from, to))
        .thenReturn(List.of(t));

    var result = taskService.getProjectTime(10L, from, to, null);

    assertThat(result.getProjectId()).isEqualTo(10L);
    assertThat(result.getProjectName()).isEqualTo("Project");
    assertThat(result.getTaskCount()).isEqualTo(1);
  }

  @Test
  void getProjectTime_withFilter_shouldReturnDto() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Project p = project(10L, "Project");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    Task t = taskWithProject(1L, "T", from.plusSeconds(100), to.minusSeconds(100), false, p);
    when(taskRepository.findByProjectOrSubprojectsAndTimeRangeAndUserId(10L, 2L, from, to))
        .thenReturn(List.of(t));

    var result = taskService.getProjectTime(10L, from, to, 2L);

    assertThat(result.getTaskCount()).isEqualTo(1);
  }

  @Test
  void getProjectTasks_shouldReturnSortedDtos() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Project p = project(10L, "Project");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    Task t1 = taskWithProject(1L, "Old", from.plusSeconds(100), from.plusSeconds(200), false, p);
    Task t2 = taskWithProject(2L, "New", to.minusSeconds(200), to.minusSeconds(100), false, p);
    when(taskRepository.findAllByProjectOrSubprojectsAndTimeRange(10L, from, to))
        .thenReturn(List.of(t1, t2));

    var result = taskService.getProjectTasks(10L, from, to, null);

    assertThat(result).hasSize(2);
    assertThat(result.get(0).getDescription()).isEqualTo("New");
  }

  @Test
  void exportProjectTasks_shouldReturnDtos() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Project p = project(10L, "Project");
    when(projectRepository.findAccessibleById(1L, 10L)).thenReturn(Optional.of(p));
    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    Task t = taskWithProject(1L, "T", from.plusSeconds(100), to.minusSeconds(100), false, p);
    when(taskRepository.findAllByProjectOrSubprojectsAndTimeRange(10L, from, to))
        .thenReturn(List.of(t));

    var result = taskService.exportProjectTasks(10L, from, to);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).getDescription()).isEqualTo("T");
  }

  @Test
  void getTask_shouldReturnDto() {
    User user = user();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    Project p = project(10L, "P");
    Task t = taskWithProject(1L, "Task", Instant.now().minusSeconds(100), Instant.now(), false, p);
    when(taskRepository.findAccessibleByIdAndUserId(1L, 1L)).thenReturn(Optional.of(t));

    var result = taskService.getTask(1L);

    assertThat(result.getId()).isEqualTo(1L);
    assertThat(result.getProjects()).hasSize(1);
    assertThat(result.getUsername()).isEqualTo("testuser");
  }
}

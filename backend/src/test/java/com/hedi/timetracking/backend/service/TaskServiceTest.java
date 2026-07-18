package com.hedi.timetracking.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.model.Task;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.ProjectRepository;
import com.hedi.timetracking.backend.repository.TaskProjectRepository;
import com.hedi.timetracking.backend.repository.TaskRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
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

  @Test
  void stopTask_shouldSetEndTimeAndRunningFalse() {
    User user = User.builder().id(1L).username("testuser").build();
    Task task =
        Task.builder()
            .id(1L)
            .description("Running")
            .startTime(Instant.now().minusSeconds(300))
            .running(true)
            .user(user)
            .build();

    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(task));
    when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

    var result = taskService.stopTask(1L);

    assertThat(result.getRunning()).isFalse();
    assertThat(result.getEndTime()).isNotNull();
  }

  @Test
  void getTask_withWrongId_shouldThrowNotFound() {
    User user = User.builder().id(1L).username("testuser").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(taskRepository.findAccessibleByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.getTask(99L))
        .isInstanceOf(ResourceNotFoundException.class);
  }
}

package com.hedi.timetracking.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.exception.ConflictException;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.model.Task;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.TaskRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
import com.hedi.timetracking.backend.security.JwtUtil;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private TaskRepository taskRepository;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private JwtUtil jwtUtil;
  @Mock private AuthenticationManager authenticationManager;

  @InjectMocks private UserService userService;

  @BeforeEach
  void setUp() {
    Authentication authentication = mock(Authentication.class);
    lenient().when(authentication.getName()).thenReturn("testuser");
    SecurityContext securityContext = mock(SecurityContext.class);
    lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void register_success_shouldReturnToken() {
    when(userRepository.existsByUsername("testuser")).thenReturn(false);
    when(userRepository.existsByEmail("e@e.com")).thenReturn(false);
    when(passwordEncoder.encode("password123")).thenReturn("hash");
    User saved =
        User.builder().id(1L).username("testuser").email("e@e.com").passwordHash("hash").build();
    when(userRepository.save(any(User.class))).thenReturn(saved);
    when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("token");

    RegisterRequest req = new RegisterRequest();
    req.setUsername("testuser");
    req.setEmail("e@e.com");
    req.setPassword("password123");

    var result = userService.register(req);

    assertThat(result.getToken()).isEqualTo("token");
    assertThat(result.getUser().getUsername()).isEqualTo("testuser");
  }

  @Test
  void register_usernameConflict_shouldThrow() {
    when(userRepository.existsByUsername("testuser")).thenReturn(true);

    RegisterRequest req = new RegisterRequest();
    req.setUsername("testuser");
    req.setEmail("e@e.com");
    req.setPassword("password123");

    assertThatThrownBy(() -> userService.register(req)).isInstanceOf(ConflictException.class);
  }

  @Test
  void register_emailConflict_shouldThrow() {
    when(userRepository.existsByUsername("testuser")).thenReturn(false);
    when(userRepository.existsByEmail("e@e.com")).thenReturn(true);

    RegisterRequest req = new RegisterRequest();
    req.setUsername("testuser");
    req.setEmail("e@e.com");
    req.setPassword("password123");

    assertThatThrownBy(() -> userService.register(req)).isInstanceOf(ConflictException.class);
  }

  @Test
  void login_success_shouldReturnToken() {
    User user =
        User.builder().id(1L).username("testuser").email("e@e.com").passwordHash("hash").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("token");

    LoginRequest req = new LoginRequest();
    req.setUsername("testuser");
    req.setPassword("password123");

    var result = userService.login(req);

    assertThat(result.getToken()).isEqualTo("token");
    verify(authenticationManager).authenticate(any());
  }

  @Test
  void login_badCredentials_shouldThrow() {
    when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

    LoginRequest req = new LoginRequest();
    req.setUsername("testuser");
    req.setPassword("wrong");

    assertThatThrownBy(() -> userService.login(req)).isInstanceOf(BadCredentialsException.class);
  }

  @Test
  void getCurrentUser_found_shouldReturnDto() {
    User user = User.builder().id(1L).username("testuser").email("e@e.com").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

    var result = userService.getCurrentUser();

    assertThat(result.getUsername()).isEqualTo("testuser");
  }

  @Test
  void getCurrentUser_notFound_shouldThrow() {
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> userService.getCurrentUser())
        .isInstanceOf(ResourceNotFoundException.class);
  }

  @Test
  void changePassword_success_shouldSave() {
    User user = User.builder().id(1L).username("testuser").passwordHash("oldhash").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("oldpassword", "oldhash")).thenReturn(true);
    when(passwordEncoder.encode("newpassword")).thenReturn("newhash");

    ChangePasswordRequest req = new ChangePasswordRequest();
    req.setOldPassword("oldpassword");
    req.setNewPassword("newpassword");

    userService.changePassword(req);

    verify(userRepository).save(user);
    assertThat(user.getPasswordHash()).isEqualTo("newhash");
  }

  @Test
  void changePassword_wrongOld_shouldThrow() {
    User user = User.builder().id(1L).username("testuser").passwordHash("oldhash").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("oldpassword", "oldhash")).thenReturn(false);

    ChangePasswordRequest req = new ChangePasswordRequest();
    req.setOldPassword("oldpassword");
    req.setNewPassword("newpassword");

    assertThatThrownBy(() -> userService.changePassword(req))
        .isInstanceOf(BadCredentialsException.class);
  }

  @Test
  void updateTimezone_shouldReturnDto() {
    User user = User.builder().id(1L).username("testuser").email("e@e.com").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

    TimezoneRequest req = new TimezoneRequest();
    req.setTimezone("Europe/Berlin");

    var result = userService.updateTimezone(req);

    assertThat(result.getTimezone()).isEqualTo("Europe/Berlin");
  }

  @Test
  void getWeeklyGoal_withTimezoneAndTarget_shouldCompute() {
    User user =
        User.builder().id(1L).username("testuser").timezone("UTC").weeklyTargetHours(10).build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    Instant now = Instant.now();
    Task t = Task.builder().id(1L).user(user).startTime(now).endTime(now.plusSeconds(3600)).build();
    when(taskRepository.findByUserId(1L)).thenReturn(List.of(t));

    var result = userService.getWeeklyGoal();

    assertThat(result.getTargetHours()).isEqualTo(10);
    assertThat(result.getSpentSeconds()).isEqualTo(3600L);
    assertThat(result.getProgressPercent()).isEqualTo(10.0);
  }

  @Test
  void getWeeklyGoal_withoutTimezone_shouldUseSystemDefault() {
    User user = User.builder().id(1L).username("testuser").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    when(taskRepository.findByUserId(1L)).thenReturn(List.of());

    var result = userService.getWeeklyGoal();

    assertThat(result.getTargetHours()).isEqualTo(0);
    assertThat(result.getProgressPercent()).isEqualTo(0.0);
    assertThat(result.getWeekStart()).isNotNull();
  }

  @Test
  void getWeeklyGoal_withoutTarget_shouldZeroProgress() {
    User user = User.builder().id(1L).username("testuser").timezone("UTC").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    Instant now = Instant.now();
    Task t = Task.builder().id(1L).user(user).startTime(now).endTime(now.plusSeconds(3600)).build();
    when(taskRepository.findByUserId(1L)).thenReturn(List.of(t));

    var result = userService.getWeeklyGoal();

    assertThat(result.getTargetHours()).isEqualTo(0);
    assertThat(result.getProgressPercent()).isEqualTo(0.0);
  }

  @Test
  void updateWeeklyTarget_shouldReturnDto() {
    User user = User.builder().id(1L).username("testuser").email("e@e.com").build();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

    var result = userService.updateWeeklyTarget(15);

    assertThat(result.getWeeklyTargetHours()).isEqualTo(15);
  }
}

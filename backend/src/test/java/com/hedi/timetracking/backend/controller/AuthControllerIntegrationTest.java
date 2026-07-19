package com.hedi.timetracking.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.timetracking.backend.TestcontainersConfiguration;
import com.hedi.timetracking.backend.dto.*;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

  @Autowired private TestRestTemplate restTemplate;

  private String token;
  private HttpHeaders headers;

  @BeforeEach
  void setUp() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest reg = new RegisterRequest();
    reg.setUsername("authuser" + unique);
    reg.setEmail("auth" + unique + "@example.com");
    reg.setPassword("password123");
    ResponseEntity<AuthResponse> auth =
        restTemplate.postForEntity("/api/auth/register", reg, AuthResponse.class);
    assertThat(auth.getStatusCode()).isEqualTo(HttpStatus.OK);
    token = auth.getBody().getToken();

    headers = new HttpHeaders();
    headers.setBearerAuth(token);
    headers.setContentType(MediaType.APPLICATION_JSON);
  }

  @Test
  void register_shouldCreateUserAndReturnToken() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("new@example.com");
    request.setPassword("password123");

    ResponseEntity<AuthResponse> response =
        restTemplate.postForEntity("/api/auth/register", request, AuthResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getToken()).isNotBlank();
    assertThat(response.getBody().getUser().getUsername()).isEqualTo("newuser");
  }

  @Test
  void register_withDuplicateUsername_shouldReturnConflict() {
    RegisterRequest request = new RegisterRequest();
    request.setUsername("dupuser");
    request.setEmail("dup1@example.com");
    request.setPassword("password123");
    restTemplate.postForEntity("/api/auth/register", request, AuthResponse.class);

    RegisterRequest request2 = new RegisterRequest();
    request2.setUsername("dupuser");
    request2.setEmail("dup2@example.com");
    request2.setPassword("password123");

    ResponseEntity<AuthResponse> response =
        restTemplate.postForEntity("/api/auth/register", request2, AuthResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
  }

  @Test
  void login_withValidCredentials_shouldReturnToken() {
    RegisterRequest reg = new RegisterRequest();
    reg.setUsername("loginuser");
    reg.setEmail("login@example.com");
    reg.setPassword("password123");
    restTemplate.postForEntity("/api/auth/register", reg, AuthResponse.class);

    LoginRequest request = new LoginRequest();
    request.setUsername("loginuser");
    request.setPassword("password123");

    ResponseEntity<AuthResponse> response =
        restTemplate.postForEntity("/api/auth/login", request, AuthResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getToken()).isNotBlank();
  }

  @Test
  void login_withInvalidCredentials_shouldReturnUnauthorized() {
    LoginRequest request = new LoginRequest();
    request.setUsername("nonexistent");
    request.setPassword("wrong");

    ResponseEntity<AuthResponse> response =
        restTemplate.postForEntity("/api/auth/login", request, AuthResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  void me_shouldReturnCurrentUser() {
    ResponseEntity<UserDto> response =
        restTemplate.exchange(
            "/api/auth/me", HttpMethod.GET, new HttpEntity<>(headers), UserDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getUsername()).startsWith("authuser");
  }

  @Test
  void changePassword_shouldUpdatePassword() {
    ChangePasswordRequest request = new ChangePasswordRequest();
    request.setOldPassword("password123");
    request.setNewPassword("newpassword456");
    HttpEntity<ChangePasswordRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<Void> response =
        restTemplate.exchange("/api/auth/password", HttpMethod.PUT, entity, Void.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

    LoginRequest loginReq = new LoginRequest();
    loginReq.setUsername(response.getHeaders().getFirst("X-Username"));
    if (loginReq.getUsername() == null) {
      loginReq.setUsername("");
    }
  }

  @Test
  void updateTimezone_shouldReturnUpdatedUser() {
    TimezoneRequest request = new TimezoneRequest();
    request.setTimezone("Europe/Berlin");
    HttpEntity<TimezoneRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<UserDto> response =
        restTemplate.exchange("/api/auth/timezone", HttpMethod.PUT, entity, UserDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getTimezone()).isEqualTo("Europe/Berlin");
  }

  @Test
  void getWeeklyGoal_shouldReturnGoal() {
    ResponseEntity<WeeklyGoalDto> response =
        restTemplate.exchange(
            "/api/auth/me/goal", HttpMethod.GET, new HttpEntity<>(headers), WeeklyGoalDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  void updateWeeklyGoal_shouldReturnUpdatedUser() {
    WeeklyGoalRequest request = new WeeklyGoalRequest();
    request.setTargetHours(20);
    HttpEntity<WeeklyGoalRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<UserDto> response =
        restTemplate.exchange("/api/auth/me/goal", HttpMethod.PUT, entity, UserDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getWeeklyTargetHours()).isEqualTo(20);
  }
}

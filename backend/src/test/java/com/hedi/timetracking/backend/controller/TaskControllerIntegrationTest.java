package com.hedi.timetracking.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.timetracking.backend.TestcontainersConfiguration;
import com.hedi.timetracking.backend.dto.*;
import java.time.Instant;
import java.util.Set;
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
class TaskControllerIntegrationTest {

  @Autowired private TestRestTemplate restTemplate;

  private String token;
  private HttpHeaders headers;

  @BeforeEach
  void setUp() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest reg = new RegisterRequest();
    reg.setUsername("taskuser" + unique);
    reg.setEmail("task" + unique + "@example.com");
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
  void getAllTasks_shouldReturnCreatedTasks() {
    StartTaskRequest request = new StartTaskRequest();
    request.setDescription("Get all task");
    HttpEntity<StartTaskRequest> entity = new HttpEntity<>(request, headers);
    restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);

    ResponseEntity<TaskDto[]> response =
        restTemplate.exchange(
            "/api/tasks", HttpMethod.GET, new HttpEntity<>(headers), TaskDto[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotEmpty();
  }

  @Test
  void getTask_byId_shouldReturnTask() {
    StartTaskRequest request = new StartTaskRequest();
    request.setDescription("Get by id");
    HttpEntity<StartTaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> startResp =
        restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);
    Long taskId = startResp.getBody().getId();

    ResponseEntity<TaskDto> response =
        restTemplate.exchange(
            "/api/tasks/" + taskId, HttpMethod.GET, new HttpEntity<>(headers), TaskDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getDescription()).isEqualTo("Get by id");
  }

  @Test
  void startTask_shouldCreateRunningTask() {
    StartTaskRequest request = new StartTaskRequest();
    request.setDescription("Working on stuff");

    HttpEntity<StartTaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> response =
        restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getRunning()).isTrue();
    assertThat(response.getBody().getDescription()).isEqualTo("Working on stuff");
  }

  @Test
  void stopTask_shouldEndRunningTask() {
    StartTaskRequest request = new StartTaskRequest();
    request.setDescription("Stop me");
    HttpEntity<StartTaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> startResp =
        restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);
    Long taskId = startResp.getBody().getId();

    ResponseEntity<TaskDto> stopResp =
        restTemplate.postForEntity(
            "/api/tasks/" + taskId + "/stop", new HttpEntity<>(headers), TaskDto.class);

    assertThat(stopResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(stopResp.getBody().getRunning()).isFalse();
    assertThat(stopResp.getBody().getEndTime()).isNotNull();
  }

  @Test
  void resumeTask_shouldRestartStoppedTask() {
    TaskRequest request = new TaskRequest();
    request.setDescription("Resume me");
    request.setStartTime(Instant.now().minusSeconds(3600));
    request.setEndTime(Instant.now());
    HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> createResp =
        restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);
    Long taskId = createResp.getBody().getId();

    ResponseEntity<TaskDto> resumeResp =
        restTemplate.postForEntity(
            "/api/tasks/" + taskId + "/resume", new HttpEntity<>(headers), TaskDto.class);

    assertThat(resumeResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(resumeResp.getBody().getRunning()).isTrue();
    assertThat(resumeResp.getBody().getEndTime()).isNull();
  }

  @Test
  void getActiveTask_shouldReturnRunningTask() {
    StartTaskRequest request = new StartTaskRequest();
    request.setDescription("Active task");
    HttpEntity<StartTaskRequest> entity = new HttpEntity<>(request, headers);
    restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);

    ResponseEntity<TaskDto> response =
        restTemplate.exchange(
            "/api/tasks/active", HttpMethod.GET, new HttpEntity<>(headers), TaskDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getRunning()).isTrue();
  }

  @Test
  void createManualTask_shouldReturnTask() {
    TaskRequest request = new TaskRequest();
    request.setDescription("Manual entry");
    request.setStartTime(Instant.now().minusSeconds(3600));
    request.setEndTime(Instant.now());

    HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> response =
        restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getRunning()).isFalse();
    assertThat(response.getBody().getDurationSeconds()).isGreaterThanOrEqualTo(3600);
  }

  @Test
  void updateTask_shouldModifyTask() {
    TaskRequest createReq = new TaskRequest();
    createReq.setDescription("Old desc");
    createReq.setStartTime(Instant.now().minusSeconds(3600));
    createReq.setEndTime(Instant.now());
    HttpEntity<TaskRequest> entity = new HttpEntity<>(createReq, headers);
    ResponseEntity<TaskDto> createResp =
        restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);
    Long taskId = createResp.getBody().getId();

    TaskRequest updateReq = new TaskRequest();
    updateReq.setDescription("New desc");
    updateReq.setStartTime(Instant.now().minusSeconds(1800));
    updateReq.setEndTime(Instant.now());
    HttpEntity<TaskRequest> updateEntity = new HttpEntity<>(updateReq, headers);
    ResponseEntity<TaskDto> updateResp =
        restTemplate.exchange("/api/tasks/" + taskId, HttpMethod.PUT, updateEntity, TaskDto.class);

    assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(updateResp.getBody().getDescription()).isEqualTo("New desc");
  }

  @Test
  void deleteTask_shouldRemoveIt() {
    TaskRequest request = new TaskRequest();
    request.setDescription("Delete me");
    request.setStartTime(Instant.now().minusSeconds(60));
    request.setEndTime(Instant.now());
    HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<TaskDto> createResp =
        restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);
    Long id = createResp.getBody().getId();

    ResponseEntity<Void> deleteResp =
        restTemplate.exchange(
            "/api/tasks/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);

    assertThat(deleteResp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
  }

  @Test
  void getOverview_shouldReturnTasksForToday() {
    TaskRequest request = new TaskRequest();
    request.setDescription("Overview task");
    request.setStartTime(Instant.now().minusSeconds(300));
    request.setEndTime(Instant.now());
    HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
    restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);

    ResponseEntity<TaskOverviewDto> response =
        restTemplate.exchange(
            "/api/tasks/overview?period=today",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            TaskOverviewDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getTasks()).isNotEmpty();
  }

  @Test
  void getProjectTime_shouldReturnTimeForProject() {
    ProjectRequest projectReq = new ProjectRequest();
    projectReq.setName("Time Project");
    HttpEntity<ProjectRequest> pEntity = new HttpEntity<>(projectReq, headers);
    ResponseEntity<ProjectDto> pResp =
        restTemplate.postForEntity("/api/projects", pEntity, ProjectDto.class);
    Long projectId = pResp.getBody().getId();

    TaskRequest taskReq = new TaskRequest();
    taskReq.setDescription("Project task");
    taskReq.setStartTime(Instant.now().minusSeconds(3600));
    taskReq.setEndTime(Instant.now());
    taskReq.setProjectIds(Set.of(projectId));
    HttpEntity<TaskRequest> tEntity = new HttpEntity<>(taskReq, headers);
    restTemplate.postForEntity("/api/tasks", tEntity, TaskDto.class);

    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    ResponseEntity<ProjectTimeDto> response =
        restTemplate.exchange(
            "/api/tasks/projects/" + projectId + "/time?from=" + from + "&to=" + to,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            ProjectTimeDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getProjectId()).isEqualTo(projectId);
    assertThat(response.getBody().getTaskCount()).isGreaterThanOrEqualTo(1);
  }

  @Test
  void getProjectTasks_shouldReturnTasksForProject() {
    ProjectRequest projectReq = new ProjectRequest();
    projectReq.setName("Tasks Project");
    HttpEntity<ProjectRequest> pEntity = new HttpEntity<>(projectReq, headers);
    ResponseEntity<ProjectDto> pResp =
        restTemplate.postForEntity("/api/projects", pEntity, ProjectDto.class);
    Long projectId = pResp.getBody().getId();

    TaskRequest taskReq = new TaskRequest();
    taskReq.setDescription("Project task list");
    taskReq.setStartTime(Instant.now().minusSeconds(1800));
    taskReq.setEndTime(Instant.now());
    taskReq.setProjectIds(Set.of(projectId));
    HttpEntity<TaskRequest> tEntity = new HttpEntity<>(taskReq, headers);
    restTemplate.postForEntity("/api/tasks", tEntity, TaskDto.class);

    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    ResponseEntity<TaskDto[]> response =
        restTemplate.exchange(
            "/api/tasks/projects/" + projectId + "/tasks?from=" + from + "&to=" + to,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            TaskDto[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotEmpty();
  }

  @Test
  void exportProjectTasks_shouldReturnCsv() {
    ProjectRequest projectReq = new ProjectRequest();
    projectReq.setName("Export Project");
    HttpEntity<ProjectRequest> pEntity = new HttpEntity<>(projectReq, headers);
    ResponseEntity<ProjectDto> pResp =
        restTemplate.postForEntity("/api/projects", pEntity, ProjectDto.class);
    Long projectId = pResp.getBody().getId();

    TaskRequest taskReq = new TaskRequest();
    taskReq.setDescription("Export task");
    taskReq.setStartTime(Instant.now().minusSeconds(1800));
    taskReq.setEndTime(Instant.now());
    taskReq.setProjectIds(Set.of(projectId));
    HttpEntity<TaskRequest> tEntity = new HttpEntity<>(taskReq, headers);
    restTemplate.postForEntity("/api/tasks", tEntity, TaskDto.class);

    Instant from = Instant.now().minusSeconds(86400);
    Instant to = Instant.now();
    ResponseEntity<String> response =
        restTemplate.exchange(
            "/api/tasks/projects/" + projectId + "/export?from=" + from + "&to=" + to,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).contains("Export task");
    assertThat(response.getBody()).contains("ID,Description");
  }
}

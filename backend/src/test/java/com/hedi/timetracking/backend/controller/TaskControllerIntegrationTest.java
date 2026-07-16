package com.hedi.timetracking.backend.controller;

import com.hedi.timetracking.backend.TestcontainersConfiguration;
import com.hedi.timetracking.backend.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
class TaskControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private String token;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() {
        RegisterRequest reg = new RegisterRequest();
        reg.setUsername("taskuser");
        reg.setEmail("task@example.com");
        reg.setPassword("password123");
        ResponseEntity<AuthResponse> auth = restTemplate.postForEntity("/api/auth/register", reg, AuthResponse.class);
        token = auth.getBody().getToken();

        headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
    }

    @Test
    void startTask_shouldCreateRunningTask() {
        TaskRequest request = new TaskRequest();
        request.setDescription("Working on stuff");

        HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<TaskDto> response = restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getRunning()).isTrue();
        assertThat(response.getBody().getDescription()).isEqualTo("Working on stuff");
    }

    @Test
    void stopTask_shouldEndRunningTask() {
        TaskRequest request = new TaskRequest();
        request.setDescription("Stop me");
        HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<TaskDto> startResp = restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);
        Long taskId = startResp.getBody().getId();

        ResponseEntity<TaskDto> stopResp = restTemplate.postForEntity(
                "/api/tasks/" + taskId + "/stop", new HttpEntity<>(headers), TaskDto.class);

        assertThat(stopResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(stopResp.getBody().getRunning()).isFalse();
        assertThat(stopResp.getBody().getEndTime()).isNotNull();
    }

    @Test
    void getActiveTask_shouldReturnRunningTask() {
        TaskRequest request = new TaskRequest();
        request.setDescription("Active task");
        HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
        restTemplate.postForEntity("/api/tasks/start", entity, TaskDto.class);

        ResponseEntity<TaskDto> response = restTemplate.exchange(
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
        ResponseEntity<TaskDto> response = restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getRunning()).isFalse();
        assertThat(response.getBody().getDurationSeconds()).isGreaterThanOrEqualTo(3600);
    }

    @Test
    void deleteTask_shouldRemoveIt() {
        TaskRequest request = new TaskRequest();
        request.setDescription("Delete me");
        request.setStartTime(Instant.now().minusSeconds(60));
        request.setEndTime(Instant.now());
        HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<TaskDto> createResp = restTemplate.postForEntity("/api/tasks", entity, TaskDto.class);
        Long id = createResp.getBody().getId();

        ResponseEntity<Void> deleteResp = restTemplate.exchange(
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

        ResponseEntity<TaskOverviewDto> response = restTemplate.exchange(
                "/api/tasks/overview?period=today", HttpMethod.GET, new HttpEntity<>(headers), TaskOverviewDto.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTasks()).isNotEmpty();
    }

}

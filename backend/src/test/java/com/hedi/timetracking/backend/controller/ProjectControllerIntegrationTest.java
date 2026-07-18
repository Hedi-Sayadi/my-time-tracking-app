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
class ProjectControllerIntegrationTest {

  @Autowired private TestRestTemplate restTemplate;

  private String token;
  private HttpHeaders headers;

  @BeforeEach
  void setUp() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest reg = new RegisterRequest();
    reg.setUsername("projectuser" + unique);
    reg.setEmail("project" + unique + "@example.com");
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
  void createProject_shouldReturnProject() {
    ProjectRequest request = new ProjectRequest();
    request.setName("Test Project");
    request.setDescription("A test project");

    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> response =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getName()).isEqualTo("Test Project");
  }

  @Test
  void getAllProjects_shouldReturnCreatedProjects() {
    ProjectRequest request = new ProjectRequest();
    request.setName("List Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);

    ResponseEntity<ProjectDto[]> response =
        restTemplate.exchange(
            "/api/projects", HttpMethod.GET, new HttpEntity<>(headers), ProjectDto[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotEmpty();
  }

  @Test
  void createSubproject_shouldLinkParent() {
    ProjectRequest parentReq = new ProjectRequest();
    parentReq.setName("Parent");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(parentReq, headers);
    ResponseEntity<ProjectDto> parentResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long parentId = parentResp.getBody().getId();

    ProjectRequest childReq = new ProjectRequest();
    childReq.setName("Child");
    childReq.setParentId(parentId);
    HttpEntity<ProjectRequest> childEntity = new HttpEntity<>(childReq, headers);
    ResponseEntity<ProjectDto> childResp =
        restTemplate.postForEntity("/api/projects", childEntity, ProjectDto.class);

    assertThat(childResp.getBody().getParentId()).isEqualTo(parentId);
  }

  @Test
  void deleteProject_shouldRemoveIt() {
    ProjectRequest request = new ProjectRequest();
    request.setName("Delete Me");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ResponseEntity<Void> deleteResp =
        restTemplate.exchange(
            "/api/projects/" + id, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);

    assertThat(deleteResp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
  }
}

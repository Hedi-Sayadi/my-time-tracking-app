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
  void getProject_byId_shouldReturnProject() {
    ProjectRequest request = new ProjectRequest();
    request.setName("Get Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ResponseEntity<ProjectDto> response =
        restTemplate.exchange(
            "/api/projects/" + id, HttpMethod.GET, new HttpEntity<>(headers), ProjectDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getName()).isEqualTo("Get Project");
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
  void updateProject_shouldModifyProject() {
    ProjectRequest createReq = new ProjectRequest();
    createReq.setName("Old Name");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(createReq, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ProjectRequest updateReq = new ProjectRequest();
    updateReq.setName("New Name");
    updateReq.setDescription("Updated desc");
    HttpEntity<ProjectRequest> updateEntity = new HttpEntity<>(updateReq, headers);
    ResponseEntity<ProjectDto> updateResp =
        restTemplate.exchange(
            "/api/projects/" + id, HttpMethod.PUT, updateEntity, ProjectDto.class);

    assertThat(updateResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(updateResp.getBody().getName()).isEqualTo("New Name");
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

  @Test
  void shareProject_shouldAddMember() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest otherReg = new RegisterRequest();
    otherReg.setUsername("other" + unique);
    otherReg.setEmail("other" + unique + "@example.com");
    otherReg.setPassword("password123");
    restTemplate.postForEntity("/api/auth/register", otherReg, AuthResponse.class);

    ProjectRequest request = new ProjectRequest();
    request.setName("Share Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ShareProjectRequest shareReq = new ShareProjectRequest();
    shareReq.setUsername("other" + unique);
    HttpEntity<ShareProjectRequest> shareEntity = new HttpEntity<>(shareReq, headers);
    ResponseEntity<ProjectMemberDto> shareResp =
        restTemplate.postForEntity(
            "/api/projects/" + id + "/share", shareEntity, ProjectMemberDto.class);

    assertThat(shareResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(shareResp.getBody().getUsername()).isEqualTo("other" + unique);
  }

  @Test
  void unshareProject_shouldRemoveMember() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest otherReg = new RegisterRequest();
    otherReg.setUsername("unshare" + unique);
    otherReg.setEmail("unshare" + unique + "@example.com");
    otherReg.setPassword("password123");
    ResponseEntity<AuthResponse> otherAuth =
        restTemplate.postForEntity("/api/auth/register", otherReg, AuthResponse.class);
    Long otherUserId = otherAuth.getBody().getUser().getId();

    ProjectRequest request = new ProjectRequest();
    request.setName("Unshare Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ShareProjectRequest shareReq = new ShareProjectRequest();
    shareReq.setUsername("unshare" + unique);
    HttpEntity<ShareProjectRequest> shareEntity = new HttpEntity<>(shareReq, headers);
    restTemplate.postForEntity(
        "/api/projects/" + id + "/share", shareEntity, ProjectMemberDto.class);

    ResponseEntity<Void> unshareResp =
        restTemplate.exchange(
            "/api/projects/" + id + "/share/" + otherUserId,
            HttpMethod.DELETE,
            new HttpEntity<>(headers),
            Void.class);

    assertThat(unshareResp.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
  }

  @Test
  void getProjectMembers_shouldReturnMembers() {
    String unique = UUID.randomUUID().toString().substring(0, 8);
    RegisterRequest otherReg = new RegisterRequest();
    otherReg.setUsername("member" + unique);
    otherReg.setEmail("member" + unique + "@example.com");
    otherReg.setPassword("password123");
    restTemplate.postForEntity("/api/auth/register", otherReg, AuthResponse.class);

    ProjectRequest request = new ProjectRequest();
    request.setName("Members Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ShareProjectRequest shareReq = new ShareProjectRequest();
    shareReq.setUsername("member" + unique);
    HttpEntity<ShareProjectRequest> shareEntity = new HttpEntity<>(shareReq, headers);
    restTemplate.postForEntity(
        "/api/projects/" + id + "/share", shareEntity, ProjectMemberDto.class);

    ResponseEntity<ProjectMemberDto[]> response =
        restTemplate.exchange(
            "/api/projects/" + id + "/members",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            ProjectMemberDto[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotEmpty();
  }

  @Test
  void getProjectBudget_shouldReturnBudget() {
    ProjectRequest request = new ProjectRequest();
    request.setName("Budget Project");
    request.setBudgetHours(10);
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ResponseEntity<ProjectBudgetDto> response =
        restTemplate.exchange(
            "/api/projects/" + id + "/budget",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            ProjectBudgetDto.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody().getProjectId()).isEqualTo(id);
    assertThat(response.getBody().getBudgetHours()).isEqualTo(10);
  }

  @Test
  void getTeamContributions_shouldReturnContributions() {
    ProjectRequest request = new ProjectRequest();
    request.setName("Team Project");
    HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<ProjectDto> createResp =
        restTemplate.postForEntity("/api/projects", entity, ProjectDto.class);
    Long id = createResp.getBody().getId();

    ResponseEntity<MemberContributionDto[]> response =
        restTemplate.exchange(
            "/api/projects/" + id + "/team",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            MemberContributionDto[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }
}

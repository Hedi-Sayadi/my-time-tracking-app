package com.hedi.timetracking.backend.controller;

import com.hedi.timetracking.backend.dto.MemberContributionDto;
import com.hedi.timetracking.backend.dto.ProjectBudgetDto;
import com.hedi.timetracking.backend.dto.ProjectDto;
import com.hedi.timetracking.backend.dto.ProjectMemberDto;
import com.hedi.timetracking.backend.dto.ProjectRequest;
import com.hedi.timetracking.backend.dto.ShareProjectRequest;
import com.hedi.timetracking.backend.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @GetMapping
  public ResponseEntity<List<ProjectDto>> getAllProjects() {
    return ResponseEntity.ok(projectService.getAllProjects());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProjectDto> getProject(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.getProject(id));
  }

  @PostMapping
  public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectRequest request) {
    return ResponseEntity.ok(projectService.createProject(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProjectDto> updateProject(
      @PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
    return ResponseEntity.ok(projectService.updateProject(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
    projectService.deleteProject(id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/share")
  public ResponseEntity<ProjectMemberDto> shareProject(
      @PathVariable Long id, @Valid @RequestBody ShareProjectRequest request) {
    return ResponseEntity.ok(projectService.shareProject(id, request));
  }

  @DeleteMapping("/{id}/share/{userId}")
  public ResponseEntity<Void> unshareProject(@PathVariable Long id, @PathVariable Long userId) {
    projectService.unshareProject(id, userId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/members")
  public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.getProjectMembers(id));
  }

  @GetMapping("/{id}/budget")
  public ResponseEntity<ProjectBudgetDto> getProjectBudget(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.getBudget(id));
  }

  @GetMapping("/{id}/team")
  public ResponseEntity<List<MemberContributionDto>> getTeamContributions(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.getTeamContributions(id));
  }
}

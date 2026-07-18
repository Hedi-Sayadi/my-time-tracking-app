package com.hedi.timetracking.backend.service;

import com.hedi.timetracking.backend.dto.ProjectMemberDto;
import com.hedi.timetracking.backend.dto.ProjectRequest;
import com.hedi.timetracking.backend.dto.ShareProjectRequest;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.model.Project;
import com.hedi.timetracking.backend.model.ProjectMember;
import com.hedi.timetracking.backend.model.Task;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.ProjectMemberRepository;
import com.hedi.timetracking.backend.repository.ProjectRepository;
import com.hedi.timetracking.backend.repository.TaskRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
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

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository projectMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private ProjectService projectService;

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

    private User owner() {
        return User.builder().id(1L).username("testuser").email("o@e.com").passwordHash("h").build();
    }

    @Test
    void getAllProjects_shouldReturnDtos() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project p = Project.builder().id(1L).name("P").description("D").user(owner).build();
        when(projectRepository.findAllAccessibleByUserId(1L)).thenReturn(List.of(p));
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        var result = projectService.getAllProjects();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("P");
    }

    @Test
    void getProject_found_shouldReturnDto() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project p = Project.builder().id(1L).name("P").description("D").user(owner).build();
        when(projectRepository.findAccessibleById(1L, 1L)).thenReturn(Optional.of(p));
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        var result = projectService.getProject(1L);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getProject_notFound_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        when(projectRepository.findAccessibleById(1L, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProject(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createProject_withoutParent_shouldReturnDto() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        Project saved = Project.builder().id(1L).name("P").description("D").budgetHours(10).user(owner).build();
        when(projectRepository.save(any(Project.class))).thenReturn(saved);
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        ProjectRequest req = new ProjectRequest();
        req.setName("P");
        req.setDescription("D");
        req.setBudgetHours(10);

        var result = projectService.createProject(req);

        assertThat(result.getName()).isEqualTo("P");
        assertThat(result.getBudgetHours()).isEqualTo(10);
    }

    @Test
    void createProject_withParent_shouldSetParent() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        Project parent = Project.builder().id(2L).name("Parent").user(owner).build();
        when(projectRepository.findAccessibleById(1L, 2L)).thenReturn(Optional.of(parent));
        Project saved = Project.builder().id(1L).name("P").user(owner).parent(parent).build();
        when(projectRepository.save(any(Project.class))).thenReturn(saved);
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        ProjectRequest req = new ProjectRequest();
        req.setName("P");
        req.setParentId(2L);

        var result = projectService.createProject(req);

        assertThat(result.getParentId()).isEqualTo(2L);
    }

    @Test
    void updateProject_withParent_shouldReturnDto() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("Old").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        Project parent = Project.builder().id(2L).name("Parent").user(owner).build();
        when(projectRepository.findAccessibleById(1L, 2L)).thenReturn(Optional.of(parent));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        ProjectRequest req = new ProjectRequest();
        req.setName("New");
        req.setDescription("D");
        req.setBudgetHours(5);
        req.setParentId(2L);

        var result = projectService.updateProject(1L, req);

        assertThat(result.getName()).isEqualTo("New");
        assertThat(result.getParentId()).isEqualTo(2L);
    }

    @Test
    void updateProject_withoutParent_shouldClearParent() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project parent = Project.builder().id(2L).name("Parent").user(owner).build();
        Project project = Project.builder().id(1L).name("Old").user(owner).parent(parent).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of());

        ProjectRequest req = new ProjectRequest();
        req.setName("New");

        var result = projectService.updateProject(1L, req);

        assertThat(result.getParentId()).isNull();
    }

    @Test
    void updateProject_selfParent_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("Old").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));

        ProjectRequest req = new ProjectRequest();
        req.setName("New");
        req.setParentId(1L);

        assertThatThrownBy(() -> projectService.updateProject(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("its own parent");
    }

    @Test
    void deleteProject_withSubprojects_shouldReparentChildren() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project parent = Project.builder().id(2L).name("parent").user(owner).build();
        Project child = Project.builder().id(3L).name("child").parent(parent).user(owner).build();
        Project toDelete = Project.builder().id(1L).name("del").user(owner)
                .subprojects(new ArrayList<>(List.of(child))).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(toDelete));

        projectService.deleteProject(1L);

        verify(projectRepository).save(child);
        verify(projectRepository).delete(toDelete);
    }

    @Test
    void shareProject_success_shouldReturnMemberDto() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        User target = User.builder().id(2L).username("target").build();
        when(userRepository.findByUsername("target")).thenReturn(Optional.of(target));
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 2L)).thenReturn(false);
        when(projectMemberRepository.save(any(ProjectMember.class))).thenAnswer(inv -> inv.getArgument(0));

        ShareProjectRequest req = new ShareProjectRequest();
        req.setUsername("target");

        var result = projectService.shareProject(1L, req);

        assertThat(result.getUsername()).isEqualTo("target");
        assertThat(result.getUserId()).isEqualTo(2L);
    }

    @Test
    void shareProject_selfShare_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));

        ShareProjectRequest req = new ShareProjectRequest();
        req.setUsername("testuser");

        assertThatThrownBy(() -> projectService.shareProject(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("yourself");
    }

    @Test
    void shareProject_alreadyMember_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        User target = User.builder().id(2L).username("target").build();
        when(userRepository.findByUsername("target")).thenReturn(Optional.of(target));
        when(projectMemberRepository.existsByProjectIdAndUserId(1L, 2L)).thenReturn(true);

        ShareProjectRequest req = new ShareProjectRequest();
        req.setUsername("target");

        assertThatThrownBy(() -> projectService.shareProject(1L, req))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void shareProject_userNotFound_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        ShareProjectRequest req = new ShareProjectRequest();
        req.setUsername("missing");

        assertThatThrownBy(() -> projectService.shareProject(1L, req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void shareProject_projectNotFound_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        ShareProjectRequest req = new ShareProjectRequest();
        req.setUsername("target");

        assertThatThrownBy(() -> projectService.shareProject(1L, req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void unshareProject_success_shouldDeleteMember() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        User target = User.builder().id(2L).username("target").build();
        ProjectMember member = ProjectMember.builder().id(10L).project(project).user(target).build();
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.of(member));

        projectService.unshareProject(1L, 2L);

        verify(projectMemberRepository).delete(member);
    }

    @Test
    void unshareProject_memberNotFound_shouldThrow() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(project));
        when(projectMemberRepository.findByProjectIdAndUserId(1L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.unshareProject(1L, 2L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getProjectMembers_shouldReturnMemberDtos() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findAccessibleById(1L, 1L)).thenReturn(Optional.of(project));
        User target = User.builder().id(2L).username("target").build();
        ProjectMember member = ProjectMember.builder().id(10L).project(project).user(target).build();
        when(projectMemberRepository.findByProjectId(1L)).thenReturn(List.of(member));

        var result = projectService.getProjectMembers(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("target");
    }

    @Test
    void getTeamContributions_shouldGroupByUser() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).build();
        when(projectRepository.findAccessibleById(1L, 1L)).thenReturn(Optional.of(project));
        User u1 = User.builder().id(2L).username("m1").build();
        User u2 = User.builder().id(3L).username("m2").build();
        Instant now = Instant.now();
        Task t1 = Task.builder().id(10L).user(u1).startTime(now).endTime(now.plusSeconds(100)).build();
        Task t2 = Task.builder().id(11L).user(u1).startTime(now).endTime(now.plusSeconds(200)).build();
        Task t3 = Task.builder().id(12L).user(u2).startTime(now).endTime(now.plusSeconds(50)).build();
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of(t1, t2, t3));

        var result = projectService.getTeamContributions(1L);

        assertThat(result).hasSize(2);
        var first = result.get(0);
        assertThat(first.getUsername()).isEqualTo("m1");
        assertThat(first.getTaskCount()).isEqualTo(2);
        assertThat(first.getTotalDurationSeconds()).isEqualTo(300L);
    }

    @Test
    void getBudget_shouldReturnBudgetDto() {
        User owner = owner();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(owner));
        Project project = Project.builder().id(1L).name("P").user(owner).budgetHours(20).build();
        when(projectRepository.findAccessibleById(1L, 1L)).thenReturn(Optional.of(project));
        Instant now = Instant.now();
        Task t = Task.builder().id(10L).user(owner).startTime(now).endTime(now.plusSeconds(3600)).build();
        when(taskRepository.findAllByProjectId(1L)).thenReturn(List.of(t));

        var result = projectService.getBudget(1L);

        assertThat(result.getProjectId()).isEqualTo(1L);
        assertThat(result.getProjectName()).isEqualTo("P");
        assertThat(result.getBudgetHours()).isEqualTo(20);
        assertThat(result.getSpentSeconds()).isEqualTo(3600L);
    }
}
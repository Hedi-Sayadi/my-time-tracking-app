package com.hedi.timetracking.backend.service;

import com.hedi.timetracking.backend.dto.ProjectDto;
import com.hedi.timetracking.backend.dto.ProjectRequest;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.exception.UnauthorizedException;
import com.hedi.timetracking.backend.model.Project;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.ProjectRepository;
import com.hedi.timetracking.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        Long userId = getCurrentUserId();
        List<Project> projects = projectRepository.findByUserId(userId);
        return projects.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(Long id) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto createProject(ProjectRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .user(user)
                .build();

        if (request.getParentId() != null) {
            Project parent = projectRepository.findByIdAndUserId(request.getParentId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent project not found"));
            project.setParent(parent);
        }

        project = projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectRequest request) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Project cannot be its own parent");
            }
            Project parent = projectRepository.findByIdAndUserId(request.getParentId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent project not found"));
            project.setParent(parent);
        } else {
            project.setParent(null);
        }

        project = projectRepository.save(project);
        return mapToDto(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Reassign children to parent or null
        for (Project child : new ArrayList<>(project.getSubprojects())) {
            child.setParent(project.getParent());
            projectRepository.save(child);
        }

        projectRepository.delete(project);
    }

    private ProjectDto mapToDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setParentId(project.getParent() != null ? project.getParent().getId() : null);
        dto.setSubprojects(project.getSubprojects().stream().map(this::mapToDto).toList());
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"))
                .getId();
    }

}

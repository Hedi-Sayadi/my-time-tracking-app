package com.hedi.timetracking.backend.service;

import com.hedi.timetracking.backend.dto.*;
import com.hedi.timetracking.backend.exception.ResourceNotFoundException;
import com.hedi.timetracking.backend.exception.UnauthorizedException;
import com.hedi.timetracking.backend.model.Project;
import com.hedi.timetracking.backend.model.ProjectMember;
import com.hedi.timetracking.backend.model.User;
import com.hedi.timetracking.backend.repository.ProjectMemberRepository;
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
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        Long userId = getCurrentUserId();
        List<Project> projects = projectRepository.findAllAccessibleByUserId(userId);
        return projects.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(Long id) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findAccessibleById(userId, id)
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
            Project parent = projectRepository.findAccessibleById(userId, request.getParentId())
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
                .orElseThrow(() -> new ResourceNotFoundException("Project not found or not owner"));

        project.setName(request.getName());
        project.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Project cannot be its own parent");
            }
            Project parent = projectRepository.findAccessibleById(userId, request.getParentId())
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
                .orElseThrow(() -> new ResourceNotFoundException("Project not found or not owner"));

        for (Project child : new ArrayList<>(project.getSubprojects())) {
            child.setParent(project.getParent());
            projectRepository.save(child);
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectMemberDto shareProject(Long projectId, ShareProjectRequest request) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found or not owner"));

        User targetUser = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        if (targetUser.getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot share project with yourself");
        }

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, targetUser.getId())) {
            throw new IllegalStateException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(targetUser)
                .build();

        member = projectMemberRepository.save(member);
        return mapMemberToDto(member);
    }

    @Transactional
    public void unshareProject(Long projectId, Long memberUserId) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found or not owner"));

        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, memberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        projectMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto> getProjectMembers(Long projectId) {
        Long userId = getCurrentUserId();
        if (!projectRepository.findAccessibleById(userId, projectId).isPresent()) {
            throw new ResourceNotFoundException("Project not found");
        }

        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::mapMemberToDto)
                .toList();
    }

    private ProjectDto mapToDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setParentId(project.getParent() != null ? project.getParent().getId() : null);
        dto.setSubprojects(project.getSubprojects().stream().map(this::mapToDto).toList());
        dto.setOwnerId(project.getUser().getId());
        dto.setOwnerUsername(project.getUser().getUsername());
        dto.setMembers(project.getMembers().stream().map(this::mapMemberToDto).toList());
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }

    private ProjectMemberDto mapMemberToDto(ProjectMember member) {
        ProjectMemberDto dto = new ProjectMemberDto();
        dto.setId(member.getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setJoinedAt(member.getCreatedAt());
        return dto;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"))
                .getId();
    }

}

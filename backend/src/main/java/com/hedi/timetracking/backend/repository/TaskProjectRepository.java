package com.hedi.timetracking.backend.repository;

import com.hedi.timetracking.backend.model.TaskProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskProjectRepository extends JpaRepository<TaskProject, Long> {

    List<TaskProject> findByTaskId(Long taskId);

    List<TaskProject> findByProjectId(Long projectId);

    void deleteByTaskId(Long taskId);

}

package com.hedi.timetracking.backend.repository;

import com.hedi.timetracking.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(Long userId);

    Optional<Project> findByIdAndUserId(Long id, Long userId);

    List<Project> findByUserIdAndParentIsNull(Long userId);

    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.id = :projectId")
    Optional<Project> findByUserAndId(@Param("userId") Long userId, @Param("projectId") Long projectId);

}

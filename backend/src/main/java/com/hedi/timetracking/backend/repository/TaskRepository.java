package com.hedi.timetracking.backend.repository;

import com.hedi.timetracking.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    Optional<Task> findByUserIdAndRunningTrue(Long userId);

    @Query("""
        SELECT DISTINCT t FROM Task t
        JOIN t.taskProjects tp
        JOIN tp.project p
        WHERE (p.id = :projectId OR p.parent.id = :projectId)
        AND t.startTime >= :from
        AND (t.endTime IS NULL OR t.endTime <= :to)
        """)
    List<Task> findAllByProjectOrSubprojectsAndTimeRange(
            @Param("projectId") Long projectId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
        SELECT DISTINCT t FROM Task t
        JOIN t.taskProjects tp
        JOIN tp.project p
        WHERE (p.id = :projectId OR p.parent.id = :projectId)
        AND t.user.id = :userId
        AND t.startTime >= :from
        AND (t.endTime IS NULL OR t.endTime <= :to)
        """)
    List<Task> findByProjectOrSubprojectsAndTimeRangeAndUserId(
            @Param("projectId") Long projectId,
            @Param("userId") Long userId,
            @Param("from") Instant from,
            @Param("to") Instant to);

}

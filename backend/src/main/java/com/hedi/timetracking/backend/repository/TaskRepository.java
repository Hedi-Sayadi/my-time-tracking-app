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
        SELECT t FROM Task t
        WHERE t.user.id = :userId
        OR EXISTS (
            SELECT 1 FROM TaskProject tp
            JOIN tp.project p
            JOIN ProjectMember pm ON pm.project.id = p.id
            WHERE tp.task.id = t.id AND pm.user.id = :userId
        )
        ORDER BY t.startTime DESC
        """)
    List<Task> findAccessibleByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT t FROM Task t
        WHERE (t.user.id = :userId
        OR EXISTS (
            SELECT 1 FROM TaskProject tp
            JOIN tp.project p
            JOIN ProjectMember pm ON pm.project.id = p.id
            WHERE tp.task.id = t.id AND pm.user.id = :userId
        ))
        AND t.startTime >= :from
        AND (t.endTime IS NULL OR t.endTime <= :to)
        ORDER BY t.startTime DESC
        """)
    List<Task> findAccessibleByUserIdAndTimeRange(
            @Param("userId") Long userId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
        SELECT t FROM Task t
        WHERE t.id = :taskId
        AND (t.user.id = :userId
        OR EXISTS (
            SELECT 1 FROM TaskProject tp
            JOIN tp.project p
            JOIN ProjectMember pm ON pm.project.id = p.id
            WHERE tp.task.id = t.id AND pm.user.id = :userId
        ))
        """)
    Optional<Task> findAccessibleByIdAndUserId(@Param("taskId") Long taskId, @Param("userId") Long userId);

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

    @Query("""
        SELECT t FROM Task t
        JOIN t.taskProjects tp
        WHERE tp.project.id = :projectId
        """)
    List<Task> findAllByProjectId(@Param("projectId") Long projectId);

}

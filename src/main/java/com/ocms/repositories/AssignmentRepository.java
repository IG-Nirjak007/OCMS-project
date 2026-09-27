package com.ocms.repositories;

import com.ocms.models.Assignment;
import com.ocms.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for {@link Assignment} entities.
 *
 * Assignments are created by instructors per course and viewed
 * by students enrolled in that course. Deadline-awareness queries
 * support the deadline logic described in AssignmentService.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Find all assignments for a specific course.
     * Primary query used by the GET /api/assignments endpoint when
     * filtered by courseId (both instructors and enrolled students).
     *
     * @param course the Course entity
     * @return list of Assignment entities for the given course
     */
    List<Assignment> findByCourse(Course course);

    /**
     * Find all assignments for a course identified by its ID.
     * Convenience overload used when only courseId is available from a path variable.
     *
     * @param courseId the ID of the course
     * @return list of Assignment entities for the given course ID
     */
    List<Assignment> findByCourseId(Long courseId);

    /**
     * Find all assignments whose due date is before a given timestamp.
     * Used to identify overdue/past-due assignments for dashboard warnings.
     *
     * @param dateTime the reference timestamp
     * @return list of assignments with dueDate before the given timestamp
     */
    List<Assignment> findByDueDateBefore(LocalDateTime dateTime);

    /**
     * Find all assignments for a course whose due date is on or after the given timestamp.
     * Used to filter upcoming (active) assignments for a course.
     *
     * @param course   the Course entity
     * @param dateTime the reference timestamp (usually LocalDateTime.now())
     * @return list of active assignments for the course
     */
    List<Assignment> findByCourseAndDueDateGreaterThanEqual(Course course, LocalDateTime dateTime);

    /**
     * Delete all assignments for a given course.
     * Called when a course is deleted to cascade-clean its assignments.
     *
     * @param course the Course entity whose assignments should be removed
     */
    void deleteByCourse(Course course);
}

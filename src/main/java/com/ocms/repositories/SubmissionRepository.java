package com.ocms.repositories;

import com.ocms.models.Assignment;
import com.ocms.models.Submission;
import com.ocms.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Submission} entities.
 *
 * Covers the full submission lifecycle:
 * - Students submit once per assignment (enforced by unique constraint on the model).
 * - Instructors view all submissions per assignment and grade them.
 * - Students view their own submission history across all assignments.
 */
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * Find all submissions for a specific assignment.
     * Used by instructors to review and grade student work.
     *
     * @param assignment the Assignment entity
     * @return list of Submission entities for the given assignment
     */
    List<Submission> findByAssignment(Assignment assignment);

    /**
     * Find all submissions made by a specific student.
     * Used in the student dashboard to show submission history.
     *
     * @param student the student User entity
     * @return list of Submission entities by the given student
     */
    List<Submission> findByStudent(User student);

    /**
     * Find a specific student's submission for a specific assignment.
     * Used to enforce one-submission-per-student rule and to return
     * the student's existing submission if they revisit the assignment page.
     *
     * @param student    the student User entity
     * @param assignment the Assignment entity
     * @return an Optional containing the matching Submission, or empty if not found
     */
    Optional<Submission> findByStudentAndAssignment(User student, Assignment assignment);

    /**
     * Check whether a student has already submitted a given assignment.
     * Used as a guard in SubmissionService before creating a new Submission.
     *
     * @param student    the student User entity
     * @param assignment the Assignment entity
     * @return true if a submission already exists for this student/assignment pair
     */
    boolean existsByStudentAndAssignment(User student, Assignment assignment);

    /**
     * Find all submissions for every assignment belonging to a course.
     * Used by instructors to get a course-wide overview of all submissions.
     *
     * @param courseId the ID of the course
     * @return list of Submission entities across all assignments in the course
     */
    @Query("SELECT s FROM Submission s WHERE s.assignment.course.id = :courseId")
    List<Submission> findByCourseId(@Param("courseId") Long courseId);

    /**
     * Find all submissions for a specific assignment that have not yet been graded.
     * Used by instructors to identify pending work requiring their attention.
     *
     * @param assignment the Assignment entity
     * @return list of Submission entities where grade is null
     */
    List<Submission> findByAssignmentAndGradeIsNull(Assignment assignment);
}

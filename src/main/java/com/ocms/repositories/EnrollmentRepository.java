package com.ocms.repositories;

import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Enrollment} entities.
 *
 * Supports student self-enrollment, un-enrollment, and the
 * instructor view of who is enrolled in their courses.
 */
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    /**
     * Find all enrollments for a specific student.
     * Used to list all courses a student is currently enrolled in.
     *
     * @param student the student User entity
     * @return list of Enrollment records for the given student
     */
    List<Enrollment> findByStudent(User student);

    /**
     * Find all enrollments for a specific course.
     * Used by an instructor to see who has enrolled in their course.
     *
     * @param course the Course entity
     * @return list of Enrollment records for the given course
     */
    List<Enrollment> findByCourse(Course course);

    /**
     * Find a specific enrollment by student and course.
     * Used to check for duplicate enrollment or to un-enroll a student.
     *
     * @param student the student User entity
     * @param course  the Course entity
     * @return an Optional containing the matching Enrollment, or empty if not found
     */
    Optional<Enrollment> findByStudentAndCourse(User student, Course course);

    /**
     * Check whether a student is already enrolled in a course.
     * Used as a guard before creating a new Enrollment record.
     *
     * @param student the student User entity
     * @param course  the Course entity
     * @return true if the student is enrolled in the course
     */
    boolean existsByStudentAndCourse(User student, Course course);

    /**
     * Retrieve all courses a student is enrolled in using a JPQL projection.
     * Returns Course objects directly, avoiding repeated join traversal in services.
     *
     * @param student the student User entity
     * @return list of Course entities the student is enrolled in
     */
    @Query("SELECT e.course FROM Enrollment e WHERE e.student = :student")
    List<Course> findCoursesByStudent(@Param("student") User student);

    /**
     * Count how many students are enrolled in a given course.
     * Useful for dashboard statistics.
     *
     * @param course the Course entity
     * @return number of enrollments in the course
     */
    long countByCourse(Course course);
}

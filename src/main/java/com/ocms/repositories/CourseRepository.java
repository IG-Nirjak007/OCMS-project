package com.ocms.repositories;

import com.ocms.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Course} entities.
 *
 * Provides queries needed by both instructors (manage their own courses)
 * and students (browse available courses by title).
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    interface CourseInstructorProjection {
        Long getId();
        String getTitle();
        String[] getInstructors();
    }

    @Query(value = "SELECT c.id AS id, c.title AS title, array_agg(u.username) AS instructors " +
            "FROM courses c " +
            "JOIN course_instructors ci ON ci.course_id = c.id " +
            "JOIN users u ON u.id = ci.instructor_id " +
            "GROUP BY c.id, c.title", nativeQuery = true)
    List<CourseInstructorProjection> findCoursesWithInstructorsAggregated();

    /**
     * Find a course by its unique title.
     * Used during course creation to prevent duplicate titles.
     *
     * @param title the course title to look up
     * @return an Optional containing the matching Course, or empty if not found
     */
    Optional<Course> findByTitle(String title);

    /**
     * Check whether a course with the given title already exists.
     * Used as a pre-save uniqueness guard in CourseService.
     *
     * @param title the course title to check
     * @return true if a course with this title exists
     */
    boolean existsByTitle(String title);

    /**
     * Find all courses whose title contains the given keyword (case-insensitive).
     * Supports a simple search/filter feature for students browsing courses.
     *
     * @param keyword the substring to search for within course titles
     * @return list of matching courses
     */
    List<Course> findByTitleContainingIgnoreCase(String keyword);

    /**
     * Find all courses taught by a specific instructor (by instructor ID).
     * Used in the instructor dashboard to list their created courses.
     *
     * @param instructorId the ID of the instructor User
     * @return list of courses that include the given instructor
     */
    List<Course> findByInstructors_Id(Long instructorId);
}

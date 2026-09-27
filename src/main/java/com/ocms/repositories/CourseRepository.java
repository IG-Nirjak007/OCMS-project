package com.ocms.repositories;

import com.ocms.models.Course;
import com.ocms.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Course} entities.
 *
 * Provides queries needed by both instructors (manage their own courses)
 * and students (browse available courses by name).
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Find all courses owned by a specific instructor.
     * Used in the instructor dashboard to list their created courses.
     *
     * @param instructor the instructor User entity
     * @return list of courses belonging to the given instructor
     */
    List<Course> findByInstructor(User instructor);

    /**
     * Find a course by its unique name.
     * Used during course creation to prevent duplicate names.
     *
     * @param name the course name to look up
     * @return an Optional containing the matching Course, or empty if not found
     */
    Optional<Course> findByName(String name);

    /**
     * Check whether a course with the given name already exists.
     * Used as a pre-save uniqueness guard in CourseService.
     *
     * @param name the course name to check
     * @return true if a course with this name exists
     */
    boolean existsByName(String name);

    /**
     * Find all courses whose name contains the given keyword (case-insensitive).
     * Supports a simple search/filter feature for students browsing courses.
     *
     * @param keyword the substring to search for within course names
     * @return list of matching courses
     */
    List<Course> findByNameContainingIgnoreCase(String keyword);
}

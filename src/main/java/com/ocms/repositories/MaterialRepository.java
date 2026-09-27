package com.ocms.repositories;

import com.ocms.models.Course;
import com.ocms.models.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for {@link Material} entities.
 *
 * Materials are course resources (PDFs, slides, videos) uploaded by instructors.
 * The primary query pattern is fetching all materials for a given course,
 * which powers the GET /api/materials/{courseId} endpoint described in MaterialController.
 */
@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    /**
     * Find all materials belonging to a specific course.
     * Used by students and instructors to list course resources.
     *
     * @param course the Course entity whose materials are requested
     * @return list of Material entities for the given course, ordered by natural insertion order
     */
    List<Material> findByCourse(Course course);

    /**
     * Find all materials belonging to a course identified by its ID.
     * Convenience overload used when only the courseId is available (e.g. from path variable).
     *
     * @param courseId the ID of the course
     * @return list of Material entities for the given course ID
     */
    List<Material> findByCourseId(Long courseId);

    /**
     * Delete all materials associated with a specific course.
     * Called when a course is deleted to cascade-clean its material records
     * (and corresponding file paths handled separately by FileStorageService).
     *
     * @param course the Course entity whose materials should be removed
     */
    void deleteByCourse(Course course);
}

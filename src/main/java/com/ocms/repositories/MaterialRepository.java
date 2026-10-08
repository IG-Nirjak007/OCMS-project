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
    List<Material> findByCourseId(Long courseId);
}

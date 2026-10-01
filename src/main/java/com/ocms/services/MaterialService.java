package com.ocms.services;
// Upload file path storage, fetch materials by course

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Material;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service for uploading and retrieving course materials.
 */
@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository   courseRepository;
    private final FileStorageService fileStorageService;

    public MaterialService(MaterialRepository materialRepository,
                           CourseRepository courseRepository,
                           FileStorageService fileStorageService) {
        this.materialRepository = materialRepository;
        this.courseRepository   = courseRepository;
        this.fileStorageService = fileStorageService;
    }

    /** Upload a material file and persist its metadata for a course. */
    public Material upload(Long courseId, String title, String contentDescription, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Material material = new Material();
        material.setTitle(title);
        material.setContentDescription(contentDescription);
        material.setCourse(course);

        if (file != null && !file.isEmpty()) {
            material.setFilePath(fileStorageService.store(file));
        }

        return materialRepository.save(material);
    }

    /** Return all materials for a given course. */
    public List<Material> findByCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }
}

package com.ocms.services;
// Upload file path storage, fetch materials by course

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Material;
import com.ocms.models.User;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.EnrollmentRepository;
import com.ocms.repositories.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for uploading and retrieving course materials.
 */
@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public MaterialService(MaterialRepository materialRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<Material> getMaterialsByCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }

    public Material saveMaterial(Long courseId, String title, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        Material material = new Material();
        material.setTitle(title);
        material.setFilePath(file.getOriginalFilename());
        material.setCourse(course);

        return materialRepository.save(material);
    }

    public void deleteMaterial(Long materialId) {
        if (!materialRepository.existsById(materialId)) {
            throw new RuntimeException("Material not found with id: " + materialId);
        }
        materialRepository.deleteById(materialId);
    }

    public List<String> getEnrolledStudentEmails(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return enrollmentRepository.findByCourse(course).stream()
                .map(enrollment -> enrollment.getStudent().getEmail())
                .collect(Collectors.toList());
    }
}

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
    private final FileStorageService fileStorageService;

    public MaterialService(MaterialRepository materialRepository, 
                           CourseRepository courseRepository, 
                           EnrollmentRepository enrollmentRepository,
                           FileStorageService fileStorageService) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Material> getMaterialsByCourse(Long courseId) {
        return materialRepository.findByCourseId(courseId);
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
    }

    public Material saveMaterial(Long courseId, String title, String description, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        Material material = new Material();
        material.setTitle(title);
        material.setContentDescription(description);
        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(file);
            material.setFilePath(storedFileName);
        }
        material.setCourse(course);

        return materialRepository.save(material);
    }

    public Material saveMaterial(Long courseId, String title, MultipartFile file) {
        return saveMaterial(courseId, title, null, file);
    }

    public void deleteMaterial(Long materialId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));
        if (material.getFilePath() != null) {
            fileStorageService.deleteFile(material.getFilePath());
        }
        materialRepository.delete(material);
    }

    public List<String> getEnrolledStudentEmails(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        return enrollmentRepository.findByCourse(course).stream()
                .map(enrollment -> enrollment.getStudent().getEmail())
                .collect(Collectors.toList());
    }
}

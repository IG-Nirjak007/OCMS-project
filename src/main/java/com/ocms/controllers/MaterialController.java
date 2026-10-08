package com.ocms.controllers;
// POST /api/courses/{courseId}/materials (TEACHER upload); GET /api/courses/{courseId}/materials

import com.ocms.dto.DTOMapper;
import com.ocms.dto.MaterialDTO;
import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Material;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.MaterialRepository;
import com.ocms.services.EmailService;
import com.ocms.services.FileStorageService;
import com.ocms.services.MaterialService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MaterialController {

    private final MaterialService materialService;
    private final EmailService emailService;

    public MaterialController(MaterialService materialService, EmailService emailService) {
        this.materialService = materialService;
        this.emailService = emailService;
    }

    // Get all materials for a specific course
    @GetMapping("/courses/{courseId}/materials")
    public ResponseEntity<List<Material>> getMaterialsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getMaterialsByCourse(courseId));
    }

    // Upload new material and trigger async email notification to enrolled students
    @PostMapping("/courses/{courseId}/materials")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Material> uploadMaterial(@PathVariable Long courseId,
                                                   @RequestParam("title") String title,
                                                   @RequestParam("file") MultipartFile file) {
        Material savedMaterial = materialService.saveMaterial(courseId, title, file);

        // Fetch enrolled student email addresses and trigger async email notifications
        List<String> studentEmails = materialService.getEnrolledStudentEmails(courseId);
        for (String email : studentEmails) {
            emailService.sendMaterialUploadAlert(email, savedMaterial.getCourse().getTitle(), savedMaterial.getTitle());
        }

        return ResponseEntity.ok(savedMaterial);
    }

    // Delete material endpoint (Required by frontend materialApi.js)
    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
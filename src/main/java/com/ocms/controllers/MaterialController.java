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
    private final FileStorageService fileStorageService;

    public MaterialController(MaterialService materialService, EmailService emailService, FileStorageService fileStorageService) {
        this.materialService = materialService;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
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
                                                   @RequestParam(value = "description", required = false) String description,
                                                   @RequestParam("file") MultipartFile file) {
        Material savedMaterial = materialService.saveMaterial(courseId, title, description, file);

        // Fetch enrolled student email addresses and trigger async email notifications
        try {
            List<String> studentEmails = materialService.getEnrolledStudentEmails(courseId);
            for (String email : studentEmails) {
                emailService.sendMaterialUploadAlert(email, savedMaterial.getCourse().getTitle(), savedMaterial.getTitle());
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(savedMaterial);
    }

    // Download/Access material file
    @GetMapping("/materials/{id}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long id) {
        Material material = materialService.getMaterialById(id);
        if (material.getFilePath() == null || material.getFilePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = fileStorageService.loadFile(material.getFilePath());
            if (filePath == null || !java.nio.file.Files.exists(filePath) || !java.nio.file.Files.isReadable(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            // Extract a display filename from stored name (strip prefix timestamp)
            String filename = filePath.getFileName().toString();
            if (filename.contains("_")) {
                filename = filename.substring(filename.indexOf('_') + 1);
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete material endpoint
    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }
}
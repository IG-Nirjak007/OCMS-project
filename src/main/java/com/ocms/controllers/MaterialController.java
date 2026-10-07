package com.ocms.controllers;
// POST /api/courses/{courseId}/materials (TEACHER upload); GET /api/courses/{courseId}/materials

import com.ocms.dto.DTOMapper;
import com.ocms.dto.MaterialDTO;
import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Material;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.MaterialRepository;
import com.ocms.services.FileStorageService;
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
@RequestMapping("/api/courses/{courseId}/materials")
public class MaterialController {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final FileStorageService fileStorageService;

    public MaterialController(MaterialRepository materialRepository, CourseRepository courseRepository, FileStorageService fileStorageService) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.fileStorageService = fileStorageService;
    }
    @GetMapping
    public List<MaterialDTO> getMaterials(@PathVariable Long courseId) {
        return materialRepository.findByCourseId(courseId).stream()
                .map(DTOMapper::toMaterialDTO)
                .collect(Collectors.toList());
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<MaterialDTO> uploadMaterial(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("contentDescription") String contentDescription,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Material material = new Material();
        material.setTitle(title);
        material.setContentDescription(contentDescription);
        material.setCourse(course);

        if (file != null && !file.isEmpty()) {
            material.setFilePath(fileStorageService.store(file));
        }

        Material saved = materialRepository.save(material);
        return ResponseEntity.ok(DTOMapper.toMaterialDTO(saved));
    }
    @GetMapping("/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long materialId) throws Exception {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found"));

        if (material.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path path = Path.of(material.getFilePath());
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
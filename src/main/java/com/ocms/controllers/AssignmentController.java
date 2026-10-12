package com.ocms.controllers;

import com.ocms.dto.*;
import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.*;
import com.ocms.repositories.*;
import com.ocms.services.AssignmentService;
import com.ocms.services.EmailService;
import com.ocms.services.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AssignmentController(AssignmentService assignmentService, UserRepository userRepository, EmailService emailService) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Get all submissions for an assignment
    @GetMapping("/assignments/{id}/submissions")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsForAssignment(id));
    }

    // CRUD: Get assignment by ID
    @GetMapping("/assignments/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    // CRUD: Create Assignment
    @PostMapping("/assignments")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> createAssignment(@RequestBody Map<String, Object> payload) {
        Long courseId = Long.valueOf(payload.get("courseId").toString());
        String title = (String) payload.get("title");
        String description = (String) payload.get("description");
        String dueDateStr = (String) payload.get("dueDate");
        java.time.LocalDateTime dueDate = null;
        if (dueDateStr != null && !dueDateStr.isBlank()) {
            try {
                if (dueDateStr.endsWith("Z")) {
                    dueDate = java.time.Instant.parse(dueDateStr).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } else {
                    dueDate = java.time.LocalDateTime.parse(dueDateStr);
                }
            } catch (Exception e) {
                try {
                    dueDate = java.time.OffsetDateTime.parse(dueDateStr).toLocalDateTime();
                } catch (Exception ignored) {
                }
            }
        }
        
        return ResponseEntity.ok(assignmentService.create(courseId, title, description, dueDate));
    }

    // CRUD: Update Assignment
    @PutMapping("/assignments/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        String description = (String) payload.get("description");
        String dueDateStr = (String) payload.get("dueDate");
        java.time.LocalDateTime dueDate = null;
        if (dueDateStr != null && !dueDateStr.isBlank()) {
            try {
                if (dueDateStr.endsWith("Z")) {
                    dueDate = java.time.Instant.parse(dueDateStr).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } else {
                    dueDate = java.time.LocalDateTime.parse(dueDateStr);
                }
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(assignmentService.update(id, title, description, dueDate));
    }

    // CRUD: Delete Assignment
    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    // CRUD: Get all assignments for a course
    @GetMapping("/courses/{courseId}/assignments")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.findByCourse(courseId));
    }
}
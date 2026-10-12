package com.ocms.controllers;

import com.ocms.models.Submission;
import com.ocms.models.User;
import com.ocms.repositories.UserRepository;
import com.ocms.services.EmailService;
import com.ocms.services.FileStorageService;
import com.ocms.services.SubmissionService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    public SubmissionController(SubmissionService submissionService, 
                                UserRepository userRepository, 
                                EmailService emailService,
                                FileStorageService fileStorageService) {
        this.submissionService = submissionService;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
    }

    // POST /api/submissions (JSON payload)
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> submitAssignment(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String fileUrl = (String) payload.get("fileUrl");
        String description = (String) payload.get("description");

        Submission submission = submissionService.submitAssignment(assignmentId, student.getId(), fileUrl, description);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Assignment submitted successfully",
                "submission", submission
        ));
    }

    // POST /api/submissions/upload (Multipart form data for file uploads)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> submitAssignmentWithFile(
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "fileUrl", required = false) String fileUrl,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Submission submission;
        if (file != null && !file.isEmpty()) {
            submission = submissionService.submitAssignmentWithFile(assignmentId, student.getId(), file, description);
        } else {
            submission = submissionService.submitAssignment(assignmentId, student.getId(), fileUrl, description);
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Assignment submitted successfully",
                "submission", submission
        ));
    }

    // GET /api/submissions/{id}/download (Download uploaded submission file)
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long id) {
        Submission submission = submissionService.getById(id);
        if (submission.getFilePath() == null || submission.getFilePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path path = fileStorageService.loadFile(submission.getFilePath());
            if (path == null || !java.nio.file.Files.exists(path) || !java.nio.file.Files.isReadable(path)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(path.toUri());
            String contentType = java.nio.file.Files.probeContentType(path);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            String filename = path.getFileName().toString();
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

    // PUT /api/submissions/{id}/grade
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Integer grade = payload.get("grade") != null ? Integer.valueOf(payload.get("grade").toString()) : null;
        String feedback = (String) payload.get("feedback");

        Submission submission = submissionService.gradeSubmission(id, grade, feedback);

        // Trigger async email alert to student
        try {
            emailService.sendAssignmentGradeAlert(submission.getStudent().getEmail(), submission.getAssignment().getTitle(), String.valueOf(grade));
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(submission);
    }
    
    // GET /api/submissions/me
    @GetMapping("/me")
    public ResponseEntity<List<Submission>> getMySubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(student.getId()));
    }
}

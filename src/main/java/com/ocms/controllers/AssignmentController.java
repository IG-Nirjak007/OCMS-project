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

    // Submit assignment using JSON payload
    @PostMapping("/assignments/submit")
    public ResponseEntity<?> submitAssignment(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String fileUrl = (String) payload.get("fileUrl");

        // We assume assignmentService has a method to save this
        assignmentService.saveSubmissionJson(assignmentId, studentId, fileUrl);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Assignment submitted successfully"
        ));
    }

    // Get all submissions for an assignment
    @GetMapping("/assignments/{id}/submissions")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsForAssignment(id));
    }

    // Grade submission with email alert trigger
    @PutMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String grade = body.get("grade");
        Submission submission = assignmentService.gradeSubmission(id, grade);

        // Trigger async email alert to student
        emailService.sendAssignmentGradeAlert(submission.getStudent().getEmail(), submission.getAssignment().getTitle(), grade);

        return ResponseEntity.ok(submission);
    }
}
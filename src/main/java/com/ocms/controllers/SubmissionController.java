package com.ocms.controllers;

import com.ocms.models.Submission;
import com.ocms.models.User;
import com.ocms.repositories.UserRepository;
import com.ocms.services.EmailService;
import com.ocms.services.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public SubmissionController(SubmissionService submissionService, UserRepository userRepository, EmailService emailService) {
        this.submissionService = submissionService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // POST /api/submissions
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

    // PUT /api/submissions/{id}/grade
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Integer grade = payload.get("grade") != null ? Integer.valueOf(payload.get("grade").toString()) : null;
        String feedback = (String) payload.get("feedback");

        Submission submission = submissionService.gradeSubmission(id, grade, feedback);

        // Trigger async email alert to student
        emailService.sendAssignmentGradeAlert(submission.getStudent().getEmail(), submission.getAssignment().getTitle(), String.valueOf(grade));

        return ResponseEntity.ok(submission);
    }
    
    // GET /api/submissions/me
    @GetMapping("/me")
    public ResponseEntity<List<Submission>> getMySubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(student.getId()));
    }
}

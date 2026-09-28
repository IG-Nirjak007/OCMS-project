package com.ocms.controllers;

import com.ocms.dto.AssignmentDTO;
import com.ocms.dto.DTOMapper;
import com.ocms.dto.SubmissionDTO;
import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Assignment;
import com.ocms.models.Course;
import com.ocms.models.Submission;
import com.ocms.models.User;
import com.ocms.repositories.AssignmentRepository;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.SubmissionRepository;
import com.ocms.repositories.UserRepository;
import com.ocms.services.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

// CRUD /api/assignments - INSTRUCTOR manages; STUDENT reads
@RestController
@RequestMapping("/api")
public class AssignmentController {
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public AssignmentController(AssignmentRepository assignmentRepository, SubmissionRepository submissionRepository,
                                CourseRepository courseRepository, UserRepository userRepository,
                                FileStorageService fileStorageService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/courses/{courseId}/assignments")
    public List<AssignmentDTO> getAssignmentsByCourse(@PathVariable Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(DTOMapper::toAssignmentDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/courses/{courseId}/assignments")
    @PreAuthorize("hasRole('Instructor')")
    public ResponseEntity<AssignmentDTO> createAssignment(@PathVariable Long courseId, @RequestBody AssignmentDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Assignment assignment = new Assignment();
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        assignment.setCourse(course);

        Assignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.ok(DTOMapper.toAssignmentDTO(saved));
    }

    @PostMapping("/assignment/{assignmentId}/submit")
    @PreAuthorize("hasRole('Student')")
    public ResponseEntity<SubmissionDTO> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("studentId") Long studentId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Submission submission = new Submission(student, assignment);

        if (file != null && !file.isEmpty()) {
            String filePath = fileStorageService.store(file);
            submission.setFilePath(filePath);
        }

        Submission saved = submissionRepository.save(submission);
        return ResponseEntity.ok(DTOMapper.toSubmissionDTO(saved));
    }
}
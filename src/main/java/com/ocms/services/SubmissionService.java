package com.ocms.services;

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Assignment;
import com.ocms.models.Submission;
import com.ocms.models.User;
import com.ocms.repositories.AssignmentRepository;
import com.ocms.repositories.SubmissionRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public SubmissionService(SubmissionRepository submissionRepository, 
                             AssignmentRepository assignmentRepository, 
                             UserRepository userRepository,
                             FileStorageService fileStorageService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    public Submission getById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
    }

    public Submission submitAssignment(Long assignmentId, Long studentId, String fileUrl, String description) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        
        // Enforce submission deadline: editing/submission only permitted before due date
        if (assignment.getDueDate() != null && java.time.LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new IllegalArgumentException("Assignment deadline has passed. Submissions or edits are no longer allowed.");
        }
        
        Submission submission = submissionRepository.findByStudentAndAssignment(student, assignment)
                .orElse(new Submission(student, assignment));
        
        if (fileUrl != null && !fileUrl.isBlank()) {
            submission.setFilePath(fileUrl);
        }
        if (description != null) {
            submission.setDescription(description);
        }
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        
        return submissionRepository.save(submission);
    }

    public Submission submitAssignmentWithFile(Long assignmentId, Long studentId, org.springframework.web.multipart.MultipartFile file, String description) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        
        // Enforce submission deadline before file storage
        if (assignment.getDueDate() != null && java.time.LocalDateTime.now().isAfter(assignment.getDueDate())) {
            throw new IllegalArgumentException("Assignment deadline has passed. Submissions or edits are no longer allowed.");
        }

        String storedFileName = null;
        if (file != null && !file.isEmpty()) {
            storedFileName = fileStorageService.storeFile(file);
        }
        return submitAssignment(assignmentId, studentId, storedFileName, description);
    }

    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        return submissionRepository.findByAssignment(assignment);
    }

    public Submission gradeSubmission(Long submissionId, Integer grade, String feedback, Long teacherId, boolean isAdmin) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!isAdmin) {
            boolean isInstructor = submission.getAssignment().getCourse().getInstructors().stream()
                    .anyMatch(inst -> inst.getId().equals(teacherId));
            if (!isInstructor) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You can only grade submissions for classrooms where you are assigned as an instructor.");
            }
        }

        if (grade != null) {
            submission.setGrade(grade);
        }
        if (feedback != null) {
            submission.setFeedback(feedback);
        }

        return submissionRepository.save(submission);
    }
    
    public List<Submission> getSubmissionsForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        return submissionRepository.findByStudent(student);
    }

    /**
     * Delete an assignment submission.
     * Enforces deadline check: submissions can ONLY be edited or deleted until the deadline.
     */
    public void deleteSubmission(Long submissionId, Long studentId, boolean isAdmin) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        if (!isAdmin && !submission.getStudent().getId().equals(studentId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to delete this submission.");
        }

        // Deadline check: only allow deleting if deadline has not passed
        if (!isAdmin && submission.getAssignment().getDueDate() != null &&
                java.time.LocalDateTime.now().isAfter(submission.getAssignment().getDueDate())) {
            throw new IllegalArgumentException("Cannot delete submission after the assignment deadline has passed (" +
                    submission.getAssignment().getDueDate() + ").");
        }

        if (submission.getFilePath() != null && !submission.getFilePath().startsWith("http")) {
            fileStorageService.deleteFile(submission.getFilePath());
        }

        submissionRepository.delete(submission);
    }
}

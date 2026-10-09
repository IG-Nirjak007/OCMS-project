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

    public SubmissionService(SubmissionRepository submissionRepository, 
                             AssignmentRepository assignmentRepository, 
                             UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    public Submission submitAssignment(Long assignmentId, Long studentId, String fileUrl, String description) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        
        // Ensure student hasn't submitted yet, or update existing. We'll check if exists.
        Submission submission = submissionRepository.findByStudentAndAssignment(student, assignment)
                .orElse(new Submission(student, assignment));
        
        submission.setFilePath(fileUrl);
        if (description != null) {
            submission.setDescription(description);
        }
        
        return submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        return submissionRepository.findByAssignment(assignment);
    }

    public Submission gradeSubmission(Long submissionId, Integer grade, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        
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
}

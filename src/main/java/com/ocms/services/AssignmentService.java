package com.ocms.services;
// Create assignments, list by course, deadline logic

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Assignment;
import com.ocms.models.Course;
import com.ocms.repositories.AssignmentRepository;
import com.ocms.repositories.CourseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for creating and querying assignments.
 */
@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final com.ocms.repositories.UserRepository userRepository;
    private final com.ocms.repositories.SubmissionRepository submissionRepository;

    public AssignmentService(AssignmentRepository assignmentRepository, CourseRepository courseRepository,
                             com.ocms.repositories.UserRepository userRepository,
                             com.ocms.repositories.SubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository     = courseRepository;
        this.userRepository       = userRepository;
        this.submissionRepository = submissionRepository;
    }

    /** Create a new assignment for the given course. */
    public Assignment create(Long courseId, String title, String description, LocalDateTime dueDate) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Assignment assignment = new Assignment();
        assignment.setTitle(title);
        assignment.setDescription(description);
        assignment.setDueDate(dueDate);
        assignment.setCourse(course);

        return assignmentRepository.save(assignment);
    }

    /** List all assignments for a course. */
    public List<Assignment> findByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId);
    }

    /** List all assignments that are past their due date. */
    public List<Assignment> findOverdue() {
        return assignmentRepository.findByDueDateBefore(LocalDateTime.now());
    }

    public com.ocms.models.Submission saveSubmissionJson(Long assignmentId, Long studentId, String fileUrl) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        com.ocms.models.User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        
        com.ocms.models.Submission submission = new com.ocms.models.Submission(student, assignment);
        submission.setFilePath(fileUrl);
        return submissionRepository.save(submission);
    }

    public List<com.ocms.models.Submission> getSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        return submissionRepository.findByAssignment(assignment);
    }

    public com.ocms.models.Submission gradeSubmission(Long submissionId, String grade) {
        com.ocms.models.Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        submission.setGrade(Integer.parseInt(grade));
        return submissionRepository.save(submission);
    }
}

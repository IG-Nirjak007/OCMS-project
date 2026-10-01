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

    public AssignmentService(AssignmentRepository assignmentRepository, CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository     = courseRepository;
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
}

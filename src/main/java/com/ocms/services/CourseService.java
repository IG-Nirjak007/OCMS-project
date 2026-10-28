package com.ocms.services;
// Business logic: create/update/delete courses, add instructors, list enrolled

// courses

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Assignment;
import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.Material;
import com.ocms.models.Submission;
import com.ocms.models.User;
import com.ocms.repositories.AssignmentRepository;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.EnrollmentRepository;
import com.ocms.repositories.MaterialRepository;
import com.ocms.repositories.SubmissionRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final MaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final FileStorageService fileStorageService;

    public CourseService(CourseRepository courseRepository, 
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository,
                         MaterialRepository materialRepository,
                         AssignmentRepository assignmentRepository,
                         SubmissionRepository submissionRepository,
                         FileStorageService fileStorageService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.materialRepository = materialRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.fileStorageService = fileStorageService;
    }

    // Live database query ensures immediate, active synchronization with PostgreSQL
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course createCourse(Course course, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        course.getInstructors().add(instructor);
        return courseRepository.save(course);
    }

    @CacheEvict(value = "courses", allEntries = true)
    public Course addInstructor(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        course.getInstructors().add(instructor);
        return courseRepository.save(course);
    }

    public Course addInstructorByEmail(Long courseId, String email) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with email: " + email));
        course.getInstructors().add(instructor);
        return courseRepository.save(course);
    }

    public Course removeInstructor(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        course.getInstructors().removeIf(instructor -> instructor.getId().equals(instructorId));
        return courseRepository.save(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }

    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setSchedule(courseDetails.getSchedule());
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);

        // 1. Delete all enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        if (!enrollments.isEmpty()) {
            enrollmentRepository.deleteAll(enrollments);
        }

        // 2. Delete all assignment submissions and assignments
        List<Assignment> assignments = assignmentRepository.findByCourse(course);
        for (Assignment assignment : assignments) {
            List<Submission> submissions = submissionRepository.findByAssignment(assignment);
            if (!submissions.isEmpty()) {
                submissionRepository.deleteAll(submissions);
            }
        }
        if (!assignments.isEmpty()) {
            assignmentRepository.deleteAll(assignments);
        }

        // 3. Delete all course materials (and files)
        List<Material> materials = materialRepository.findByCourse(course);
        for (Material material : materials) {
            if (material.getFilePath() != null) {
                fileStorageService.deleteFile(material.getFilePath());
            }
        }
        if (!materials.isEmpty()) {
            materialRepository.deleteAll(materials);
        }

        // 4. Remove instructor associations
        course.getInstructors().clear();
        courseRepository.save(course);

        // 5. Delete course entity
        courseRepository.delete(course);
    }
}
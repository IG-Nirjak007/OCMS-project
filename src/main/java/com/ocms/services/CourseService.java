package com.ocms.services;
// Business logic: create/update/delete courses, add instructors, list enrolled
// courses

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.User;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.EnrollmentRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public Course createCourse(Course course, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        course.getInstructors().add(instructor);
        return courseRepository.save(course);
    }

    public Course addInstructor(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        course.getInstructors().add(instructor);
        return courseRepository.save(course);
    }

    public Enrollment enrollStudent(Long courseId, Long studentId) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new IllegalArgumentException("Student already enrolled in this course");
        }
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return enrollmentRepository.save(new Enrollment(student, course));
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
}
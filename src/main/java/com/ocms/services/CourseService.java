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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
            EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Cacheable(value = "courses")
    public List<Course> getAllCourses() {

        return courseRepository.findAll();
    }

    // Clears 'courses' cache in Redis whenever a new course is added
    @CacheEvict(value = "courses", allEntries = true)
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

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }

    public List<Course> getCoursesForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return enrollmentRepository.findCoursesByStudent(student);
    }

    @CacheEvict(value = "courses", allEntries = true)
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setSchedule(courseDetails.getSchedule());
        return courseRepository.save(course);
    }

    @CacheEvict(value = "courses", allEntries = true)
    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

}
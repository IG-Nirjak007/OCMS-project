package com.ocms.controllers;
// CRUD /api/courses - TEACHER creates/manages; STUDENT views enrolled courses

import com.ocms.dto.CourseCreateDTO;
import com.ocms.dto.CourseDTO;
import com.ocms.dto.DTOMapper;
import com.ocms.dto.EnrollmentDTO;
import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.User;
import com.ocms.repositories.CourseRepository;
import com.ocms.repositories.EnrollmentRepository;
import com.ocms.repositories.UserRepository;
import com.ocms.services.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    public CourseController(CourseService courseService, UserRepository userRepository) {
        this.courseService = courseService;
        this.userRepository = userRepository;
    }

    // Create course
    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course, @AuthenticationPrincipal UserDetails userDetails) {
        User instructor = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        Course createdCourse = courseService.createCourse(course, instructor.getId());
        return ResponseEntity.ok(createdCourse);
    }

    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // Get student's enrolled courses using JWT principal
    @GetMapping("/enrolled")
    public ResponseEntity<List<Course>> getEnrolledCourses(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(courseService.getCoursesForStudent(student.getId()));
    }

    // Secure enrollment deriving student ID from JWT principal
    @PostMapping("/{id}/enroll")
    public ResponseEntity<?> enrollStudent(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        courseService.enrollStudent(id, student.getId());
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully."));
    }

    // Update course
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        return ResponseEntity.ok(courseService.updateCourse(id, courseDetails));
    }

    // Delete course
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
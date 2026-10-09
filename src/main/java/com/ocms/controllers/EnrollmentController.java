package com.ocms.controllers;

import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.User;
import com.ocms.repositories.UserRepository;
import com.ocms.services.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    public EnrollmentController(EnrollmentService enrollmentService, UserRepository userRepository) {
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
    }

    // POST /api/enrollments - Enroll student in course
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal UserDetails userDetails) {
        Long courseId = payload.get("courseId");
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        enrollmentService.enrollStudent(courseId, student.getId());
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully."));
    }

    // GET /api/enrollments - Get student's enrolled courses using JWT principal
    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getEnrolledCourses(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(enrollmentService.getCoursesForStudent(student.getId()));
    }
    
    // GET /api/enrollments/course/{courseId} - Get all enrollments for a specific course (TEACHER)
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForCourse(courseId));
    }
    
    // DELETE /api/enrollments/{courseId} - Unenroll student
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long courseId, @AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        enrollmentService.unenrollStudent(courseId, student.getId());
        return ResponseEntity.ok(Map.of("message", "Unenrolled successfully."));
    }
}

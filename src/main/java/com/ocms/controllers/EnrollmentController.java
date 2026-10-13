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

    // POST /api/enrollments - Enroll student in course (Self-enrollment or Admin/Teacher assigning a student)
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> enrollStudent(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal UserDetails userDetails) {
        Long courseId = payload.get("courseId");
        User caller = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        boolean isPrivileged = caller.getRoles().stream()
                .anyMatch(r -> r.getName().contains("ADMIN") || r.getName().contains("TEACHER"));

        Long studentId;
        if (isPrivileged && payload.containsKey("studentId") && payload.get("studentId") != null) {
            studentId = payload.get("studentId");
        } else {
            studentId = caller.getId();
        }

        enrollmentService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok(Map.of("message", "Enrolled successfully."));
    }

    // POST /api/enrollments/course/{courseId}/students/{studentId} - Admin/Teacher admits a student to a classroom
    @PostMapping("/course/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> admitStudentToCourse(@PathVariable Long courseId, @PathVariable Long studentId) {
        enrollmentService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok(Map.of("message", "Student admitted successfully."));
    }

    // GET /api/enrollments - Get student's enrolled courses using JWT principal
    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getEnrolledCourses(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(enrollmentService.getCoursesForStudent(student.getId()));
    }
    
    // GET /api/enrollments/course/{courseId} - Get all enrollments for a specific course (TEACHER / ADMIN)
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<List<Enrollment>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForCourse(courseId));
    }
    
    // DELETE /api/enrollments/{courseId} - Unenroll student (Self or by Admin/Teacher)
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> unenrollStudent(
            @PathVariable Long courseId,
            @RequestParam(value = "studentId", required = false) Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        boolean isPrivileged = caller.getRoles().stream()
                .anyMatch(r -> r.getName().contains("ADMIN") || r.getName().contains("TEACHER"));

        Long targetStudentId = (isPrivileged && studentId != null) ? studentId : caller.getId();
        enrollmentService.unenrollStudent(courseId, targetStudentId);
        return ResponseEntity.ok(Map.of("message", "Unenrolled successfully."));
    }

    // DELETE /api/enrollments/course/{courseId}/students/{studentId} - Admin/Teacher removes student from classroom
    @DeleteMapping("/course/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeStudentFromCourse(@PathVariable Long courseId, @PathVariable Long studentId) {
        enrollmentService.unenrollStudent(courseId, studentId);
        return ResponseEntity.ok(Map.of("message", "Student removed from course successfully."));
    }
}

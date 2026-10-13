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
import com.ocms.services.EnrollmentService;
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
    private final EnrollmentService enrollmentService;

    public CourseController(CourseService courseService, UserRepository userRepository, EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.userRepository = userRepository;
        this.enrollmentService = enrollmentService;
    }

    // Get all courses (Catalog)
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Create course (supports assigning teacher and admitting students)
    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody CourseCreateDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        Long targetInstructorId;
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName().contains("ADMIN"));

        if (isAdmin && dto.getInstructorId() != null) {
            targetInstructorId = dto.getInstructorId();
        } else if (dto.getInstructorId() != null) {
            targetInstructorId = dto.getInstructorId();
        } else {
            targetInstructorId = currentUser.getId();
        }

        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setSchedule(dto.getSchedule());

        Course createdCourse = courseService.createCourse(course, targetInstructorId);

        // Admit/enroll initial students if specified
        if (dto.getStudentIds() != null && !dto.getStudentIds().isEmpty()) {
            for (Long sId : dto.getStudentIds()) {
                try {
                    enrollmentService.enrollStudent(createdCourse.getId(), sId);
                } catch (Exception ignored) {
                }
            }
        }

        return ResponseEntity.ok(createdCourse);
    }

    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // Update course
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        return ResponseEntity.ok(courseService.updateCourse(id, courseDetails));
    }

    // Add co-instructor to course
    @PostMapping("/{courseId}/instructors")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> addInstructor(@PathVariable Long courseId, @RequestBody Map<String, Object> payload) {
        if (payload.containsKey("email")) {
            return ResponseEntity.ok(courseService.addInstructorByEmail(courseId, payload.get("email").toString()));
        } else if (payload.containsKey("instructorId")) {
            Long instructorId = Long.valueOf(payload.get("instructorId").toString());
            return ResponseEntity.ok(courseService.addInstructor(courseId, instructorId));
        }
        return ResponseEntity.badRequest().build();
    }

    // Remove co-instructor from course
    @DeleteMapping("/{courseId}/instructors/{instructorId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Course> removeInstructor(@PathVariable Long courseId, @PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.removeInstructor(courseId, instructorId));
    }

    // Delete course
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
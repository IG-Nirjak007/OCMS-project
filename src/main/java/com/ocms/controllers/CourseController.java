package com.ocms.controllers;
// CRUD /api/courses - INSTRUCTOR creates; STUDENT views enrolled courses

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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseController(CourseRepository courseRepository,UserRepository userRepository,EnrollmentRepository enrollmentRepository){
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository =enrollmentRepository;
    }
    @GetMapping
    public List<CourseDTO> getAllCourse(){
        return courseRepository.findAll().stream()
                .map(DTOMapper::toCourseDTO)
                .collect(Collectors.toList());
    }
    @PostMapping
    @PreAuthorize("hasRole('Instructor')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseCreateDTO dto,@RequestParam Long instructorId){
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setSchedule(dto.getSchedule());
        course.getInstructors().add(instructor);

        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(DTOMapper.toCourseDTO(saved));
    }
    @PostMapping("/{courseId}/instructors/{instructorId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> addInstructor(@PathVariable Long courseId, @PathVariable Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        course.getInstructors().add(instructor);
        return ResponseEntity.ok(DTOMapper.toCourseDTO(courseRepository.save(course)));
    }
    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentDTO> enrollStudent(@PathVariable Long courseId, @RequestParam Long studentId) {
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new IllegalArgumentException("Student already enrolled");
        }
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Enrollment enrollment = enrollmentRepository.save(new Enrollment(student, course));
        return ResponseEntity.ok(DTOMapper.toEnrollmentDTO(enrollment));
    }

}
package com.ocms.config;

import com.ocms.models.*;
import com.ocms.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Seeds canonical roles, default user accounts (Teacher, Admin, Student),
 * and starter classroom data (idempotent).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CourseRepository courseRepository;
    private final MaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      CourseRepository courseRepository,
                      MaterialRepository materialRepository,
                      AssignmentRepository assignmentRepository,
                      EnrollmentRepository enrollmentRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
        this.assignmentRepository = assignmentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public void run(String... args) {
        Role studentRole = seedRole("ROLE_STUDENT");
        Role teacherRole = seedRole("ROLE_TEACHER");
        Role adminRole = seedRole("ROLE_ADMIN");

        // Seed or update Prakash Teacher (prakashteacher1@gmail.com / prakashteacher)
        User teacher = seedOrUpdateUser(
                "prakashteacher",
                "prakashteacher1@gmail.com",
                "prakashteacher",
                teacherRole
        );

        // Seed System Admin (admin@ocms.com / admin123)
        User admin = seedOrUpdateUser(
                "admin",
                "admin@ocms.com",
                "admin123",
                adminRole
        );

        // Seed Sample Student (student@ocms.com / student123)
        User student = seedOrUpdateUser(
                "student_alex",
                "student@ocms.com",
                "student123",
                studentRole
        );

        // Seed initial classroom if none exists
        if (courseRepository.count() == 0) {
            Course demoCourse = new Course();
            demoCourse.setTitle("Full-Stack Software Engineering (React & Spring Boot)");
            demoCourse.setDescription("Master enterprise web development with Java Spring Boot, PostgreSQL, and React.");
            demoCourse.setSchedule("Mon/Wed/Fri 10:00 - 11:30 AM");
            demoCourse.setInstructors(new HashSet<>(Collections.singletonList(teacher)));
            Course savedCourse = courseRepository.save(demoCourse);

            // Admit student to the classroom
            enrollmentRepository.save(new Enrollment(student, savedCourse));

            // Seed study material
            Material syllabus = Material.builder()
                    .title("Course Syllabus & Getting Started Guide")
                    .contentDescription("Detailed curriculum breakdown, grading policies, and IDE setup instructions.")
                    .contentData("## Welcome to Full-Stack Software Engineering!\n\n" +
                            "In this course, you will learn:\n" +
                            "1. **Spring Boot Backend**: REST APIs, JPA/Hibernate ORM, Spring Security, JWT authentication.\n" +
                            "2. **PostgreSQL Database**: Relational design, ACID transactions, migrations.\n" +
                            "3. **React Modern Frontend**: Hooks, Router, State Management, Responsive Design.\n\n" +
                            "### Grading Breakdown:\n" +
                            "- Assignments: 50%\n" +
                            "- Midterm Project: 25%\n" +
                            "- Final Classroom Assessment: 25%")
                    .contentType("SYLLABUS")
                    .course(savedCourse)
                    .createdAt(LocalDateTime.now())
                    .build();
            materialRepository.save(syllabus);

            Material lectureNote = Material.builder()
                    .title("Lecture 1: Architecture of Enterprise Systems")
                    .contentDescription("Core concepts: 3-tier architecture, MVC pattern, and REST principles.")
                    .contentData("### Enterprise Architecture Notes\n\n" +
                            "Enterprise applications typically follow a tiered architecture:\n\n" +
                            "- **Presentation Layer**: Client-facing UI (React SPA)\n" +
                            "- **API / Controller Layer**: Handles HTTP requests, validations, and routing\n" +
                            "- **Service Layer**: Business logic and transaction boundaries\n" +
                            "- **Data Access Layer**: JPA repositories interacting with PostgreSQL\n\n" +
                            "Keep your controllers thin and business logic inside dedicated services!")
                    .contentType("NOTE")
                    .course(savedCourse)
                    .createdAt(LocalDateTime.now())
                    .build();
            materialRepository.save(lectureNote);

            // Seed Assignment with deadline in 7 days
            Assignment assignment = Assignment.builder()
                    .title("Assignment 1: Database Entities & Security Config")
                    .description("Implement Lombok-annotated JPA entities and configure Spring Security with role-based access control. Submit your code repository link or summary before the deadline.")
                    .dueDate(LocalDateTime.now().plusDays(7))
                    .course(savedCourse)
                    .createdAt(LocalDateTime.now())
                    .build();
            assignmentRepository.save(assignment);
        }
    }

    private Role seedRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }

    private User seedOrUpdateUser(String username, String email, String rawPassword, Role role) {
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByUsernameIgnoreCase(username.trim()))
                .orElse(null);

        if (user == null) {
            user = new User();
            user.setUsername(username.trim());
            user.setEmail(cleanEmail);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRoles(new HashSet<>(Collections.singletonList(role)));
            return userRepository.save(user);
        } else {
            // Update password & ensure role is set cleanly
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRoles(new HashSet<>(Collections.singletonList(role)));
            return userRepository.save(user);
        }
    }
}



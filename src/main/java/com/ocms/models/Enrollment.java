package com.ocms.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing student enrollment into a course classroom.
 * Uses Lombok for automated accessors and constructor generation.
 */
@Entity
@Table(name = "course_enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "student_id", "course_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id")
    private User student;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"instructors", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime enrolledAt = LocalDateTime.now();

    public Enrollment(User student, Course course) {
        this.student = student;
        this.course = course;
        this.enrolledAt = LocalDateTime.now();
    }
}
package com.ocms.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Represents a student's submission for an assignment.
 * A submission is linked to a specific Assignment and User (student).
 * Instructors can grade submissions and leave feedback.
 * Uses Lombok for automated accessors and constructor generation.
 */
@Entity
@Table(
    name = "submissions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "assignment_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id")
    private User student;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"course", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    private String filePath;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    private Integer grade;

    @Column(length = 1000)
    private String feedback;

    public Submission(User student, Assignment assignment) {
        this.student = student;
        this.assignment = assignment;
        this.submittedAt = LocalDateTime.now();
    }
}
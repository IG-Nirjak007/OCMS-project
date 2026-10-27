package com.ocms.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing an assignment within a course.
 * Uses Lombok for automated accessors and constructor generation.
 */
@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private LocalDateTime dueDate;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"instructors", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
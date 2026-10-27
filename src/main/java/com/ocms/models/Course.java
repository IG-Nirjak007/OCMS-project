package com.ocms.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing an online course/classroom.
 * Managed by instructors with enrolled students.
 * Uses Lombok for automated accessors and constructor generation.
 */
@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(length = 2000)
    private String description;

    private String schedule;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "course_instructors",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "instructor_id")
    )
    @Builder.Default
    private Set<User> instructors = new HashSet<>();

    public Course(String title, String description, User instructor) {
        this.title = title;
        this.description = description;
        if (instructor != null) {
            this.instructors.add(instructor);
        }
    }
}
package com.ocms.models;

import jakarta.persistence.*;

/**
 * Represents a course in the OCMS platform.
 * A course belongs to an instructor (User with ROLE_INSTRUCTOR)
 * and can have many enrolled students via the Enrollment entity.
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique course name / title. */
    @Column(nullable = false, unique = true)
    private String name;

    /** Optional detailed description of the course. */
    @Column(length = 2000)
    private String description;

    /**
     * The instructor who owns / created this course.
     * Stored as a FK column "instructor_id" in the courses table.
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public Course() {
    }

    public Course(String name, String description, User instructor) {
        this.name        = name;
        this.description = description;
        this.instructor  = instructor;
    }

    // ---------------------------------------------------------------
    // Getters & Setters
    // ---------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public User getInstructor() {
        return instructor;
    }

    public void setInstructor(User instructor) {
        this.instructor = instructor;
    }
}
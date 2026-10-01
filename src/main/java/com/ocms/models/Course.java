package com.ocms.models;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a course in the OCMS platform.
 * A course is created by one or more instructors (Users with ROLE_INSTRUCTOR)
 * and can have many enrolled students via the Enrollment entity.
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique course title. */
    @Column(nullable = false, unique = true)
    private String title;

    /** Optional detailed description of the course. */
    @Column(length = 2000)
    private String description;

    /** Optional schedule information (e.g. "Mon/Wed 9-11am"). */
    private String schedule;

    /**
     * The instructors who own / teach this course.
     * Stored as a join table "course_instructors".
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_instructors",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "instructor_id")
    )
    private Set<User> instructors = new HashSet<>();

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public Course() {
    }

    public Course(String title, String description, User instructor) {
        this.title       = title;
        this.description = description;
        if (instructor != null) {
            this.instructors.add(instructor);
        }
    }

    // ---------------------------------------------------------------
    // Getters & Setters
    // ---------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public Set<User> getInstructors() {
        return instructors;
    }

    public void setInstructors(Set<User> instructors) {
        this.instructors = instructors;
    }
}
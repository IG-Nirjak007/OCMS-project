package com.ocms.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Represents a student's submission for an assignment.
 * A submission is linked to a specific {@link Assignment} and
 * the {@link User} (student) who submitted it.
 *
 * Instructors can grade submissions by setting a numeric score
 * and optional feedback comment.
 */
@Entity
@Table(
    name = "submissions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "assignment_id"})
    }
)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The student who made this submission. */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    /** The assignment this submission belongs to. */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    /**
     * Optional path to an uploaded file (e.g. PDF, ZIP).
     * Stored/served via FileStorageService.
     */
    private String filePath;

    /** Short description or text-based answer from the student. */
    @Column(length = 2000)
    private String description;

    /** Timestamp when the submission was made. */
    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    /**
     * Numeric grade assigned by the instructor (0–100).
     * Null until graded.
     */
    private Integer grade;

    /** Optional instructor feedback comment. */
    @Column(length = 1000)
    private String feedback;

    // ---------------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------------

    public Submission() {
    }

    public Submission(User student, Assignment assignment) {
        this.student    = student;
        this.assignment = assignment;
    }

    // ---------------------------------------------------------------
    // Getters & Setters
    // ---------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Assignment getAssignment() {
        return assignment;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getGrade() {
        return grade;
    }

    public void setGrade(Integer grade) {
        this.grade = grade;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
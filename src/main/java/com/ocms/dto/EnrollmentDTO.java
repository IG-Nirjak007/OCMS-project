package com.ocms.dto;

import java.time.LocalDateTime;

public class EnrollmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;

    public EnrollmentDTO() {}

    public EnrollmentDTO(Long id, Long studentId, String studentName, Long courseId, String courseTitle, LocalDateTime enrolledAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.enrolledAt = enrolledAt;
    }

    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public Long getCourseId() { return courseId; }
    public String getCourseTitle() { return courseTitle; }
    public LocalDateTime getEnrolledAt() { return enrolledAt; }
}
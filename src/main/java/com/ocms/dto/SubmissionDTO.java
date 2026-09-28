package com.ocms.dto;

import java.time.LocalDateTime;

public class SubmissionDTO {
    private Long id;
    private String filePath;
    private Integer grade;
    private String feedback;
    private LocalDateTime submittedAt;
    private Long assignmentId;
    private Long studentId;

    public SubmissionDTO() {}

    public SubmissionDTO(Long id, String filePath, Integer grade, String feedback, LocalDateTime submittedAt, Long assignmentId, Long studentId) {
        this.id = id;
        this.filePath = filePath;
        this.grade = grade;
        this.feedback = feedback;
        this.submittedAt = submittedAt;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
    }

    public Long getId() { return id; }
    public String getFilePath() { return filePath; }
    public Integer getGrade() { return grade; }
    public String getFeedback() { return feedback; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public Long getAssignmentId() { return assignmentId; }
    public Long getStudentId() { return studentId; }
}
package com.ocms.dto;

import java.time.LocalDateTime;

public class AssignmentDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Long courseId;

    public AssignmentDTO() {}

    public AssignmentDTO(Long id, String title, String description, LocalDateTime dueDate, Long courseId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.courseId = courseId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getDueDate() { return dueDate; }
    public Long getCourseId() { return courseId; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}
package com.ocms.dto;

public class MaterialDTO {
    private Long id;
    private String title;
    private String contentDescription;
    private String filePath;
    private Long courseId;

    public MaterialDTO() {}

    public MaterialDTO(Long id, String title, String contentDescription, String filePath, Long courseId) {
        this.id = id;
        this.title = title;
        this.contentDescription = contentDescription;
        this.filePath = filePath;
        this.courseId = courseId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContentDescription() { return contentDescription; }
    public String getFilePath() { return filePath; }
    public Long getCourseId() { return courseId; }
}
package com.ocms.dto;

public class CourseCreateDTO {
    private String title;
    private String description;
    private String schedule;

    public String getTitle() {return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }
}

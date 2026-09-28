package com.ocms.dto;



import java.util.Set;

public class CourseDTO{
    private Long id;
    private String title;
    private String description;
    private String schedule;
    private Set<UserDTO> instructors;

    public CourseDTO(){}
    public CourseDTO(Long id, String title, String description, String schedule, Set<UserDTO> instructors){
        this.id = id;
        this.title = title;
        this.description = description;
        this.schedule = schedule;
        this.instructors = instructors;
    }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSchedule() { return schedule; }
    public Set<UserDTO> getInstructors() { return instructors; }

}
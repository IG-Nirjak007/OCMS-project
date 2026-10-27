package com.ocms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCreateDTO {
    private String title;
    private String description;
    private String schedule;
    private Long instructorId;
    private List<Long> studentIds;
}

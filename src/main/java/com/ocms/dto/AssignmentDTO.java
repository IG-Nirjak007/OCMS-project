package com.ocms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Long courseId;
}
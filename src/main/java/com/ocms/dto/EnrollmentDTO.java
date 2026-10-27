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
public class EnrollmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private LocalDateTime enrolledAt;
}
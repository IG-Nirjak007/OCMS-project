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
public class SubmissionDTO {
    private Long id;
    private String filePath;
    private Integer grade;
    private String feedback;
    private LocalDateTime submittedAt;
    private Long assignmentId;
    private Long studentId;
}
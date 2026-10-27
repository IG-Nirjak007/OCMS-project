package com.ocms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Course Material.
 * Supports file attachments and direct in-database textual content.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialDTO {
    private Long id;
    private String title;
    private String contentDescription;
    private String filePath;
    private String contentData;
    private String contentType;
    private Long courseId;
}
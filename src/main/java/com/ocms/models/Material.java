package com.ocms.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing educational content, study material, or lesson text.
 * Supports both direct DB content storage (contentData) and external file paths.
 * Uses Lombok for automated accessors and constructor generation.
 */
@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String contentDescription;

    /** Path to uploaded local or storage file (PDF, slide, video). */
    private String filePath;

    /**
     * Direct database storage for rich text, markdown notes, articles, or transcripts.
     * Saved in PostgreSQL as TEXT so it can be easily accessed and viewed directly.
     */
    @Column(columnDefinition = "TEXT")
    private String contentData;

    /** Content categorization: ARTICLE, FILE, SLIDE, VIDEO, or NOTE. */
    @Column(length = 50)
    @Builder.Default
    private String contentType = "FILE";

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"instructors", "hibernateLazyInitializer", "handler"})
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
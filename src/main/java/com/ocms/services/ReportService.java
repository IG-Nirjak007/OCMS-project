package com.ocms.services;

import com.ocms.repositories.CourseRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final CourseRepository courseRepository;

    public ReportService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public String generateSystemSummaryReport() {
        StringBuffer reportBuilder = new StringBuffer();
        reportBuilder.append("=== OCMS System Summary Report ===\n");

        courseRepository.findCoursesWithInstructorsAggregated().forEach(proj -> {
            reportBuilder.append("Course ID: ").append(proj.getId())
                    .append(" | Title: ").append(proj.getTitle())
                    .append(" | Instructors: ").append(String.join(", ", proj.getInstructors()))
                    .append("\n");
        });

        return reportBuilder.toString();
    }
}



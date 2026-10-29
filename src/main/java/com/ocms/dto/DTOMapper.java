package com.ocms.dto;

import com.ocms.models.Assignment;
import com.ocms.models.Course;
import com.ocms.models.Enrollment;
import com.ocms.models.Material;
import com.ocms.models.Submission;
import com.ocms.models.User;

import java.util.stream.Collectors;

/**
 * Utility mapper converting JPA entities to safe, decoupled Data Transfer Objects.
 */
public class DTOMapper {

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                user.getApproved() != null ? user.getApproved() : false
        );
    }

    public static CourseDTO toCourseDTO(Course course) {
        if (course == null) return null;
        return new CourseDTO(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getSchedule(),
                course.getInstructors().stream().map(DTOMapper::toUserDTO).collect(Collectors.toSet())
        );
    }

    public static MaterialDTO toMaterialDTO(Material material) {
        if (material == null) return null;
        return MaterialDTO.builder()
                .id(material.getId())
                .title(material.getTitle())
                .contentDescription(material.getContentDescription())
                .filePath(material.getFilePath())
                .contentData(material.getContentData())
                .contentType(material.getContentType())
                .courseId(material.getCourse() != null ? material.getCourse().getId() : null)
                .build();
    }

    public static AssignmentDTO toAssignmentDTO(Assignment assignment) {
        if (assignment == null) return null;
        return new AssignmentDTO(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDueDate(),
                assignment.getCourse() != null ? assignment.getCourse().getId() : null
        );
    }

    public static SubmissionDTO toSubmissionDTO(Submission submission) {
        if (submission == null) return null;
        return new SubmissionDTO(
                submission.getId(),
                submission.getFilePath(),
                submission.getGrade(),
                submission.getFeedback(),
                submission.getSubmittedAt(),
                submission.getAssignment() != null ? submission.getAssignment().getId() : null,
                submission.getStudent() != null ? submission.getStudent().getId() : null
        );
    }

    public static EnrollmentDTO toEnrollmentDTO(Enrollment enrollment) {
        if (enrollment == null) return null;
        return new EnrollmentDTO(
                enrollment.getId(),
                enrollment.getStudent() != null ? enrollment.getStudent().getId() : null,
                enrollment.getStudent() != null ? enrollment.getStudent().getUsername() : null,
                enrollment.getCourse() != null ? enrollment.getCourse().getId() : null,
                enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : null,
                enrollment.getEnrolledAt()
        );
    }
}
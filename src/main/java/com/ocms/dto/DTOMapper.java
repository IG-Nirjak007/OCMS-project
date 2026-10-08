package com.ocms.dto;

import com.ocms.models.*;
import java.util.stream.Collectors;

public class DTOMapper {

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles()
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
        return new MaterialDTO(
                material.getId(),
                material.getTitle(),
                material.getContentDescription(),
                material.getFilePath(),
                material.getCourse().getId()
        );
    }

    public static AssignmentDTO toAssignmentDTO(Assignment assignment) {
        if (assignment == null) return null;
        return new AssignmentDTO(
                assignment.getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDueDate(),
                assignment.getCourse().getId()
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
                submission.getAssignment().getId(),
                submission.getStudent().getId()
        );
    }

    public static EnrollmentDTO toEnrollmentDTO(Enrollment enrollment) {
        if (enrollment == null) return null;
        return new EnrollmentDTO(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getStudent().getUsername(),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getEnrolledAt()
        );
    }
}
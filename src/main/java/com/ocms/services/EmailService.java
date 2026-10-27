package com.ocms.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendMaterialUploadAlert(String studentEmail, String courseTitle, String materialName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(studentEmail);
            message.setSubject("New Material Uploaded: " + courseTitle);
            message.setText("New course material '" + materialName + "' has been published in " + courseTitle + ".");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send material upload alert to " + studentEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendAssignmentGradeAlert(String studentEmail, String assignmentTitle, String grade){
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(studentEmail);
            message.setSubject("Assignment Graded: " + assignmentTitle);
            message.setText("Your submission for '" + assignmentTitle + "' has been graded. Score: " + grade);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send grade alert to " + studentEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("OCMS Password Reset OTP");
            message.setText("Your OTP code for resetting your password is: " + otpCode + ". It will expire in 5 minutes.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("[EmailService] Failed to send OTP email to " + toEmail + ": " + e.getMessage());
        }
    }
}
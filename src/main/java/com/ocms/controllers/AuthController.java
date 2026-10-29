package com.ocms.controllers;
// POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout

import com.ocms.config.JwtUtils;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.dto.UserDTO;
import com.ocms.dto.DTOMapper;
import com.ocms.repositories.UserRepository;
import com.ocms.services.EmailService;
import com.ocms.services.OtpService;
import com.ocms.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final UserService userService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserRepository userRepository,
                          UserService userService,
                          OtpService otpService,
                          EmailService emailService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.userService = userService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // POST /api/auth/register — supports registering as STUDENT or TEACHER (requires Admin approval)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        String requestedRole = registerRequest.getRole();
        String roleToAssign = "STUDENT";
        if (requestedRole != null && requestedRole.trim().toUpperCase().contains("TEACHER")) {
            roleToAssign = "TEACHER";
        }

        User user = userService.register(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                roleToAssign
        );
        UserDTO userDTO = DTOMapper.toUserDTO(user);
        return ResponseEntity.ok(Map.of(
            "message", "Registration submitted successfully! Your account is pending administrator approval before you can log in.",
            "user", userDTO,
            "pendingApproval", true
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            String loginId = loginRequest.getEmail() != null ? loginRequest.getEmail().trim() : "";

            // Check if user exists and whether the account has been approved by an administrator
            User user = userRepository.findByEmailIgnoreCase(loginId)
                    .or(() -> userRepository.findByUsernameIgnoreCase(loginId))
                    .or(() -> userRepository.findByEmail(loginId))
                    .or(() -> userRepository.findByUsername(loginId))
                    .orElse(null);

            if (user != null && !Boolean.TRUE.equals(user.getApproved())) {
                return ResponseEntity.status(403).body(Map.of(
                    "message", "Your account registration is pending administrator approval. Please wait for an administrator to approve your account before logging in."
                ));
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginId, loginRequest.getPassword())
            );

            if (user == null) {
                user = userRepository.findByEmailIgnoreCase(loginId)
                        .or(() -> userRepository.findByUsernameIgnoreCase(loginId))
                        .orElseThrow(() -> new RuntimeException("User not found with identifier: " + loginId));
            }

            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDTO userDto = DTOMapper.toUserDTO(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userDto);

            return ResponseEntity.ok(response);
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Your account registration is pending administrator approval. Please wait for an administrator to approve your account before logging in."
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Login error: " + e.getMessage()));
        }
    }

    // GET /api/auth/me — returns the currently authenticated user
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String principal = userDetails.getUsername();
        User user = userRepository.findByEmailIgnoreCase(principal)
                .or(() -> userRepository.findByUsernameIgnoreCase(principal))
                .or(() -> userRepository.findByEmail(principal))
                .or(() -> userRepository.findByUsername(principal))
                .orElseThrow(() -> new RuntimeException("User not found: " + principal));

        UserDTO userDto = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(userDto);
    }

    // POST /api/auth/request-otp — send OTP for password reset
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address is required."));
        }
        String cleanEmail = email.trim().toLowerCase();

        // Check if user actually exists in the database
        var userOpt = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail))
                .or(() -> userRepository.findByUsernameIgnoreCase(cleanEmail));
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "No account registered with email: " + cleanEmail));
        }

        String targetEmail = userOpt.get().getEmail();
        String otp = otpService.generateAndStoreOtp(targetEmail);
        try {
            emailService.sendOtpEmail(targetEmail, otp);
        } catch (Exception e) {
            System.err.println("[AuthController] SMTP send failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "OTP sent successfully to " + targetEmail,
            "email", targetEmail,
            "otp", otp
        ));
    }

    // POST /api/auth/verify-otp — validate OTP and return a reset token
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and 6-digit OTP code are required."));
        }

        String cleanEmail = email.trim().toLowerCase();
        boolean isValid = otpService.validateOtp(cleanEmail, otp.trim());
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP code. Please try again."));
        }

        String resetToken = jwtUtils.generateResetToken(cleanEmail);
        return ResponseEntity.ok(Map.of(
            "resetToken", resetToken,
            "message", "OTP verified successfully. You may now set a new password."
        ));
    }

    // POST /api/auth/reset-password — update password using a valid reset token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetToken = request.get("resetToken");
        String newPassword = request.get("newPassword");

        if (email == null || resetToken == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
        }

        String cleanEmail = email.trim().toLowerCase();
        if (!jwtUtils.validateResetToken(resetToken, cleanEmail)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset token. Please request a new OTP."));
        }

        User user = userRepository.findByEmailIgnoreCase(cleanEmail)
                .or(() -> userRepository.findByEmail(cleanEmail))
                .orElseThrow(() -> new RuntimeException("User not found with email: " + cleanEmail));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully. You can now log in with your new password."));
    }

    // ── Inner request DTOs ────────────────────────────────────────────────────

    /** Login request body: { email, password } */
    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    /** Register request body: { username, email, password, role? } */
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String role;

        public RegisterRequest() {}

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
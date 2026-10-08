package com.ocms.controllers;
// POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout

import com.ocms.config.JwtUtils;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.dto.UserDTO;
import com.ocms.repositories.UserRepository;
import com.ocms.services.EmailService;
import com.ocms.services.OtpService;
import com.ocms.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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

    // POST /api/auth/register — open registration for STUDENT / TEACHER
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        User user = userService.register(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                registerRequest.getRole() != null ? registerRequest.getRole() : "STUDENT"
        );
        UserDTO userDTO = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(Map.of("message", "User registered successfully.", "user", userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + loginRequest.getEmail()));

            UserDTO userDto = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userDto);

            return ResponseEntity.ok(response);
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

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO userDto = new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(userDto);
    }

    // POST /api/auth/request-otp — send OTP for password reset
    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = otpService.generateAndStoreOtp(email);
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // POST /api/auth/verify-otp — validate OTP and return a reset token
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        boolean isValid = otpService.validateOtp(email, otp);
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        String resetToken = jwtUtils.generateResetToken(email);
        return ResponseEntity.ok(Map.of("resetToken", resetToken));
    }

    // POST /api/auth/reset-password — update password using a valid reset token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetToken = request.get("resetToken");
        String newPassword = request.get("newPassword");

        if (!jwtUtils.validateResetToken(resetToken, email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired reset token"));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
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
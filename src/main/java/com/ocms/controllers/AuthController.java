package com.ocms.controllers;
// POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout

import com.ocms.config.JwtUtils;
import com.ocms.dto.AuthRequestDTO;
import com.ocms.dto.RegisterRequestDTO;
import com.ocms.dto.UserDTO;
import com.ocms.dto.DTOMapper;
import com.ocms.models.User;
import com.ocms.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final com.ocms.services.OtpService otpService;
    private final com.ocms.services.EmailService emailService;
    private final com.ocms.repositories.UserRepository userRepository;

    public AuthController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          com.ocms.services.OtpService otpService,
                          com.ocms.services.EmailService emailService,
                          com.ocms.repositories.UserRepository userRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.otpService = otpService;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            User user = userService.register(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRole() != null ? request.getRole() : "STUDENT"
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(DTOMapper.toUserDTO(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Login and receive JWT token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            String token = jwtUtils.generateJwtToken(authentication);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    // Logout — invalidates the server-side security context
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    // OTP verification sendOTP(user)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        String otp = otpService.generateAndSaveOtp(email);
        emailService.sendOtpEmail(email, otp);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (otpService.validateOtp(email, otp)) {
            // Can be followed by /reset-password endpoint in a full system
            return ResponseEntity.ok(Map.of("status", "success", "message", "OTP verified successfully"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired OTP"));
    }
}
package com.ocms.controllers;
// POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout

import com.ocms.dto.AuthRequestDTO;
import com.ocms.dto.DTOMapper;
import com.ocms.dto.RegisterRequestDTO;
import com.ocms.dto.UserDTO;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.repositories.RoleRepository;
import com.ocms.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerDto) {
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }

        if (userRepository.existsByEmail(registerDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        String rawRole = registerDto.getRole() != null ? registerDto.getRole() : "STUDENT";
        String formattedRole = rawRole.startsWith("ROLE_") ? rawRole.toUpperCase() : "ROLE_" + rawRole.toUpperCase();

        Role role = roleRepository.findByName(formattedRole)
                .orElseGet(() -> roleRepository.save(new Role(formattedRole)));

        user.setRoles(Collections.singleton(role));
        User savedUser = userRepository.save(user);

        UserDTO userDTO = DTOMapper.toUserDTO(savedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AuthRequestDTO authDto) {
        User user = userRepository.findByUsername(authDto.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(authDto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        UserDTO userDTO = DTOMapper.toUserDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}
package com.ocms.controllers;

import com.ocms.dto.UserDTO;
import com.ocms.models.User;
import com.ocms.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET /api/users/me - Returns the currently authenticated user
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
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

    // GET /api/users/students - Accessible to TEACHER & ADMIN for admitting students to classrooms
    @GetMapping("/students")
    public ResponseEntity<java.util.List<UserDTO>> getStudents() {
        java.util.List<UserDTO> students = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().contains("STUDENT")))
                .map(com.ocms.dto.DTOMapper::toUserDTO)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(students);
    }

    // GET /api/users/teachers - Accessible to TEACHER & ADMIN for co-instructor assignment
    @GetMapping("/teachers")
    public ResponseEntity<java.util.List<UserDTO>> getTeachers() {
        java.util.List<UserDTO> teachers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().contains("TEACHER") || r.getName().contains("ADMIN")))
                .map(com.ocms.dto.DTOMapper::toUserDTO)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(teachers);
    }
}

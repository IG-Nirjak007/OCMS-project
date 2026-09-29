package com.ocms.controllers;
// POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout

import com.ocms.dto.DTOMapper;
import com.ocms.dto.UserDTO;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.repositories.RoleRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<?> registerUser(@RequestParam String username,
                                          @RequestParam String password,
                                          @RequestParam String email,
                                          @RequestParam String roleName){
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        String formattedRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName.toUpperCase();
        Role role = roleRepository.findByName(formattedRole)
                .orElseGet(() -> roleRepository.save(new Role(formattedRole)));

        user.setRoles(Collections.singleton(role));
        User savedUser = userRepository.save(user);

        UserDTO userDTO = DTOMapper.toUserDTO(savedUser);
        return ResponseEntity.ok(userDTO);
    }
}
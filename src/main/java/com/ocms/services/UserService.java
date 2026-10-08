package com.ocms.services;

import com.ocms.exception.ResourceNotFoundException;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.repositories.RoleRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Service for user registration, lookup, and role assignment.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.roleRepository  = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user with the given role (e.g. "STUDENT" or "INSTRUCTOR").
     * Throws IllegalArgumentException if the username is already taken.
     */
    public User register(String username, String email, String rawPassword, String roleName) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }

        String formattedRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName.toUpperCase();
        Role role = roleRepository.findByName(formattedRole)
                .orElseGet(() -> roleRepository.save(new Role(formattedRole)));

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRoles(Collections.singleton(role));

        return userRepository.save(user);
    }

    /** Find a user by ID, throws ResourceNotFoundException if missing. */
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    /** Find a user by username, returns empty Optional if not found. */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /** Return all users (admin use). */
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /** Delete a user by ID (admin use). Throws ResourceNotFoundException if not found. */
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }
}

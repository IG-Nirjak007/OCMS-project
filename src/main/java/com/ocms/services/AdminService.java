package com.ocms.services;

import com.ocms.dto.UserDTO;
import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.repositories.RoleRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for admin-level operations such as updating a user's role.
 */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AdminService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Updates the role of a user identified by userId.
     * Accepts role names like "ADMIN", "STUDENT", "TEACHER"
     * (with or without the "ROLE_" prefix).
     *
     * @param userId   the ID of the user to update
     * @param roleName the target role name
     * @return a UserDTO reflecting the updated user
     */
    @Transactional
    public UserDTO updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Normalize to "ROLE_XXX" format
        String formattedRole = roleName.toUpperCase();
        if (!formattedRole.startsWith("ROLE_")) {
            formattedRole = "ROLE_" + formattedRole;
        }

        final String finalFormattedRole = formattedRole;
        Role role = roleRepository.findByName(finalFormattedRole)
                .orElseGet(() -> roleRepository.save(new Role(finalFormattedRole)));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User savedUser = userRepository.saveAndFlush(user);

        return new UserDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRoles());
    }
}

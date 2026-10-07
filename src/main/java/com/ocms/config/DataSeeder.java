package com.ocms.config;

import com.ocms.models.Role;
import com.ocms.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the three canonical roles into the database on every startup (idempotent).
 * Role names must match what Spring Security expects (ROLE_ prefix) and what the
 * React frontend sends/stores: ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataSeeder(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        seedRole("ROLE_STUDENT");
        seedRole("ROLE_TEACHER");
        seedRole("ROLE_ADMIN");
    }

    private void seedRole(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(new Role(roleName));
        }
    }
}


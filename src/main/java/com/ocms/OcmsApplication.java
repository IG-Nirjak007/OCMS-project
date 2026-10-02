package com.ocms;

import com.ocms.models.Role;
import com.ocms.models.User;
import com.ocms.repositories.RoleRepository;
import com.ocms.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@SpringBootApplication
@EnableAsync
public class OcmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OcmsApplication.class, args);
    }

    /**
     * Provides a UserDetailsService bean so Spring Security can authenticate
     * users stored in the database. Without this bean, Spring Security's
     * auto-configuration generates a random in-memory password and ignores
     * the custom /api/auth/** endpoints.
     */
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException(
                            "User not found: " + username));

            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList());

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password(user.getPassword())
                    .authorities(authorities)
                    .build();
        };
    }

    /**
     * Seeds the required roles (ROLE_STUDENT, ROLE_INSTRUCTOR) into the
     * database at startup if they do not already exist.
     */
    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            for (String roleName : List.of("ROLE_STUDENT", "ROLE_INSTRUCTOR")) {
                roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(new Role(roleName)));
            }
        };
    }
}


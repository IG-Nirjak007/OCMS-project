package com.ocms.repositories;

import com.ocms.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for {@link Role} entities.
 *
 * Roles (ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN) are seeded at application startup
 * and looked up by name when assigning roles to a newly registered user.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find a role by its unique name (e.g. "ROLE_STUDENT", "ROLE_TEACHER", "ROLE_ADMIN").
     * Used by the AuthService when assigning a default role to a new user.
     *
     * @param name the role name to look up
     * @return an Optional containing the matching Role, or empty if not found
     */
    Optional<Role> findByName(String name);
}

package com.ocms.repositories;

import com.ocms.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for {@link User} entities.
 *
 * Spring Security requires finding users by username for authentication.
 * The email lookup is used to enforce uniqueness and support login-by-email.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their unique username.
     * Used by Spring Security's UserDetailsService during authentication.
     *
     * @param username the username to look up
     * @return an Optional containing the matching User, or empty if not found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by their unique email address.
     * Used for email-based login or duplicate-registration checks.
     *
     * @param email the email address to look up
     * @return an Optional containing the matching User, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check whether a username is already taken.
     * Used during registration to return a meaningful error before saving.
     *
     * @param username the username to check
     * @return true if a user with this username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check whether an email is already registered.
     * Used during registration to prevent duplicate accounts.
     *
     * @param email the email to check
     * @return true if a user with this email exists
     */
    boolean existsByEmail(String email);
}

package com.ocms.dto;

import com.ocms.models.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Data Transfer Object representing safe user information.
 * Uses Lombok for accessors and accepts both Role entities and String names.
 */
@Getter
@Setter
@NoArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private Boolean approved;

    public UserDTO(Long id, String username, String email, Collection<?> roles) {
        this(id, username, email, roles, true);
    }

    public UserDTO(Long id, String username, String email, Collection<?> roles, Boolean approved) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.approved = approved != null ? approved : false;
        if (roles == null) {
            this.roles = new HashSet<>();
        } else {
            this.roles = roles.stream()
                    .map(r -> (r instanceof Role) ? ((Role) r).getName() : String.valueOf(r))
                    .collect(Collectors.toSet());
        }
    }
}
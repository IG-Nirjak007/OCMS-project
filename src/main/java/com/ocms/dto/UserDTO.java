package com.ocms.dto;

import com.ocms.models.Role;
import java.util.Set;
import java.util.stream.Collectors;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;

    public UserDTO() {}

    public UserDTO(Long id, String username, String email, Set<Role> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        // Safely extract role names into simple strings to prevent JSON recursion
        this.roles = (roles != null)
                ? roles.stream().map(Role::getName).collect(Collectors.toSet())
                : Set.of();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
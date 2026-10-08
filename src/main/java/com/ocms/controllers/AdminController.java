package com.ocms.controllers;

import com.ocms.dto.DTOMapper;
import com.ocms.dto.UserDTO;
import com.ocms.services.AdminService;
import com.ocms.services.ReportService;
import com.ocms.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only controller for user management and system oversight.
 * All endpoints require ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AdminService adminService;
    private final ReportService reportService;

    public AdminController(UserService userService, AdminService adminService, ReportService reportService) {
        this.userService = userService;
        this.adminService = adminService;
        this.reportService = reportService;
    }

    /**
     * Update a user's role by ID.
     * Body: { "role": "STUDENT" | "TEACHER" | "ADMIN" }
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        UserDTO updatedUser = adminService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(updatedUser);
    }

    /** Get all users (admin overview). */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.findAll()
                .stream()
                .map(DTOMapper::toUserDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /** Expose platform stats / system summary report. */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        String report = reportService.generateSystemSummaryReport();
        return ResponseEntity.ok(Map.of("report", report));
    }

    /** Remove a user account by ID. */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User account removed successfully."));
    }

    // ── Inner DTO for role-update request body ────────────────────────────────

    public static class RoleUpdateRequest {
        private String role;

        public RoleUpdateRequest() {}

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
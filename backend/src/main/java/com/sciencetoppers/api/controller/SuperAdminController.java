package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.security.JwtUtil;
import com.sciencetoppers.api.service.LoginAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginAuditService loginAuditService;

    private boolean isSuperAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        try {
            return "SUPER_ADMIN".equalsIgnoreCase(jwtUtil.extractRole(authHeader.substring(7)));
        } catch (Exception exception) {
            return false;
        }
    }

    @GetMapping("/recent-logins")
    public ResponseEntity<?> recentLogins(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isSuperAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Super Admin access required"));
        }
        try {
            return ResponseEntity.ok(loginAuditService.recent());
        } catch (Exception exception) {
            return ResponseEntity.status(502)
                    .body(Map.of("error", "Login history database is unavailable: " + exception.getMessage()));
        }
    }
}

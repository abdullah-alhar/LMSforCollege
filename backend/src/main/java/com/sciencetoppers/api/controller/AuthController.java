package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.dto.LoginRequest;
import com.sciencetoppers.api.security.JwtUtil;
import com.sciencetoppers.api.service.AuthService;
import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FirebaseService firebaseService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body("Unauthorized: " + ex.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody(required = false) Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (request == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }

            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "currentPassword and newPassword are required"));
            }

            System.out.println("Changing password for token username: " + username);
            
            // Find UID for this username
            String uid = firebaseService.resolveUidByUsername(username).get();
            System.out.println("Resolved UID: " + uid);
            
            if (uid == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Verify current password
            boolean isMatch = firebaseService.verifyUserPassword(uid, currentPassword).get();
            System.out.println("Password match: " + isMatch);
            
            if (!isMatch) {
                return ResponseEntity.status(401).body(Map.of("error", "Incorrect current password"));
            }

            // Update password
            System.out.println("Updating password...");
            firebaseService.updateUserPassword(uid, newPassword).get();
            System.out.println("Password updated!");

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            System.err.println("Error changing password: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to change password: " + e.getMessage()));
        }
    }
}

package com.sciencetoppers.api.controller.admin;

import com.sciencetoppers.api.dto.GrantAccessRequest;
import com.sciencetoppers.api.service.AccessControlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/admin/access")
public class AdminAccessController {

    @Autowired
    private AccessControlService accessControlService;

    @PostMapping("/grant")
    public ResponseEntity<?> grantAccess(@RequestBody GrantAccessRequest request) {
        if (request.getStudentId() == null || request.getStudentId().isBlank()
                || request.getSubjectId() == null || request.getSubjectId().isBlank()
                || request.getVideoId() == null || request.getVideoId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId, subjectId, and videoId are required"));
        }

        // Prefer days-based expiry if provided (> 0); otherwise fall back to an
        // explicit absolute expiryTimestamp; 0/unset on both means perpetual access.
        long expiryTimestamp = request.getDays() > 0
                ? System.currentTimeMillis() + request.getDays() * 86_400_000L
                : request.getExpiryTimestamp();

        try {
            accessControlService.grantAccessAsync(
                request.getStudentId(),
                request.getSubjectId(),
                request.getVideoId(),
                expiryTimestamp
            ).get();
            return ResponseEntity.ok(Map.of("message", "Access granted successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("Failed to grant access: " + e.getMessage());
        }
    }

    @DeleteMapping("/revoke")
    public ResponseEntity<?> revokeAccess(@RequestParam String studentId,
                                           @RequestParam String subjectId,
                                           @RequestParam String videoId) {
        try {
            accessControlService.revokeAccess(studentId, subjectId, videoId).get();
            return ResponseEntity.ok(Map.of("message", "Access revoked successfully"));
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("Failed to revoke access: " + e.getMessage());
        }
    }
}
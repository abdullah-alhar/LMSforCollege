package com.sciencetoppers.api.controller.admin;

import com.sciencetoppers.api.dto.AdminCreateStudentRequest;
import com.sciencetoppers.api.security.JwtUtil;
import com.sciencetoppers.api.service.FirebaseService;
import com.sciencetoppers.api.service.WebDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private WebDeviceService webDeviceService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractUsername(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return jwtUtil.extractUsername(authHeader.substring(7));
    }

    private boolean isAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        try {
            String role = jwtUtil.extractRole(authHeader.substring(7));
            return "ADMIN".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role);
        } catch (Exception exception) {
            return false;
        }
    }

    @GetMapping
    public ResponseEntity<?> listStudents() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> students = firebaseService.getStudents().get();
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<?> createStudent(
            @RequestBody AdminCreateStudentRequest request) throws ExecutionException, InterruptedException {

        String requestedIndex = request.getIndex();
        if (requestedIndex != null && !requestedIndex.trim().isEmpty()) {
            boolean taken = firebaseService.isIndexTaken(requestedIndex, null).get();
            if (taken) {
                return ResponseEntity.badRequest().body(Map.of("error", "This index number is already in use. Please provide a new index."));
            }
        }

        String uid = requestedIndex != null && !requestedIndex.isBlank()
                ? requestedIndex
                : request.getUsername().replaceAll("\\s+", "_").toLowerCase() + "_" + System.currentTimeMillis() % 10000;

        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("name", request.getUsername());
        userData.put("pass", request.getPassword());
        if (requestedIndex != null && !requestedIndex.isBlank()) {
            userData.put("index", requestedIndex);
        }
        String role = request.getRole() != null ? request.getRole() : "STUDENT";
        userData.put("type", role.equalsIgnoreCase("ADMIN") ? "admin" : "student");
        userData.put("created", System.currentTimeMillis());
        userData.put("profileComplete", false);

        firebaseService.updateStudent(uid, userData).get();

        return ResponseEntity.ok(Map.of(
            "message", "Student created successfully",
            "uid", uid,
            "username", request.getUsername()
        ));

    }

    /**
     * PUT /api/admin/students/{uid}
     * Updates name, index, role, and optionally password for a student.
     */
    @PutMapping("/{uid}")
    public ResponseEntity<?> updateStudent(
            @PathVariable String uid,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        try {
            Map<String, Object> updates = new LinkedHashMap<>();

            if (body.containsKey("username")) {
                updates.put("name", body.get("username"));
            }
            if (body.containsKey("index")) {
                Object idxObj = body.get("index");
                String newIndex = idxObj != null ? String.valueOf(idxObj) : null;
                if (newIndex != null && !newIndex.trim().isEmpty()) {
                    boolean taken = firebaseService.isIndexTaken(newIndex, uid).get();
                    if (taken) {
                        return ResponseEntity.badRequest().body(Map.of("error", "This index number is already in use. Please provide a new index."));
                    }
                }
                updates.put("index", newIndex);
            }
            if (body.containsKey("role")) {
                String role = String.valueOf(body.get("role"));
                updates.put("type", role.equalsIgnoreCase("ADMIN") ? "admin" : "student");
            }
            if (body.containsKey("password")) {
                String newPass = String.valueOf(body.get("password"));
                if (!newPass.isBlank()) {
                    updates.put("pass", newPass);
                }
            }

            if (updates.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No fields to update"));
            }

            firebaseService.updateStudent(uid, updates).get();
            return ResponseEntity.ok(Map.of("message", "Student updated successfully", "uid", uid));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update student: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/students/{uid}
     * Permanently deletes a student's user node from Firebase.
     */
    @DeleteMapping("/{uid}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable String uid,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        firebaseService.deleteStudent(uid).get();
        return ResponseEntity.ok(Map.of("message", "Student deleted", "uid", uid));
    }

    @PostMapping("/{uid}/reset-mobile-device")
    public ResponseEntity<?> resetMobileDevice(
            @PathVariable String uid,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        int clearedPaths = firebaseService.resetStudentMobileDevice(uid).get();
        return ResponseEntity.ok(Map.of(
                "message", "Mobile app device registration reset",
                "uid", uid,
                "clearedPaths", clearedPaths
        ));
    }

    @PostMapping("/{uid}/reset-web-browser")
    public ResponseEntity<?> resetWebBrowser(
            @PathVariable String uid,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        webDeviceService.reset(uid);
        return ResponseEntity.ok(Map.of(
                "message", "Web browser registration reset",
                "uid", uid
        ));
    }
}

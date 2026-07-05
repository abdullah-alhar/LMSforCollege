package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.model.PaymentInfo;
import com.sciencetoppers.api.service.FirebaseService;
import com.sciencetoppers.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;
import java.util.Map;

@RestController
@RequestMapping("/api/payment-info")
public class PaymentInfoController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping("/all")
    public Map<String, Object> getAllPaymentInfo() throws ExecutionException, InterruptedException {
        return firebaseService.getAllPaymentDetails().get();
    }

    @GetMapping("/{subjectId}")
    public Map<String, Object> getPaymentInfo(@PathVariable String subjectId) throws ExecutionException, InterruptedException {
        return firebaseService.getPaymentDetails(subjectId).get();
    }

    @Autowired
    private JwtUtil jwtUtil;

    @PutMapping("/{subjectId}")
    public org.springframework.http.ResponseEntity<?> savePaymentInfo(
            @PathVariable String subjectId,
            @RequestBody Map<String, Object> details,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        String role;
        try {
            role = jwtUtil.extractRole(authHeader.substring(7));
        } catch (Exception exception) {
            return org.springframework.http.ResponseEntity.status(401).body(Map.of("error", "Invalid session"));
        }
        if (!"ADMIN".equalsIgnoreCase(role) && !"SUPER_ADMIN".equalsIgnoreCase(role)) {
            return org.springframework.http.ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        firebaseService.savePaymentDetails(subjectId, details).get();
        return org.springframework.http.ResponseEntity.ok(Map.of("message", "Payment details saved"));
    }
}

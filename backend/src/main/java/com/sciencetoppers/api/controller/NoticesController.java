package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/notices")
public class NoticesController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping
    public ResponseEntity<?> getNotices() {
        try {
            return ResponseEntity.ok(firebaseService.getNotices().get());
        } catch (InterruptedException | ExecutionException e) {
            return ResponseEntity.status(500).body("Error fetching notices: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> addNotice(@RequestBody java.util.Map<String, Object> body) {
        try {
            String title = body.get("title") != null ? String.valueOf(body.get("title")) : "";
            String desc = body.get("desc") != null ? String.valueOf(body.get("desc")) : "";
            String type = body.get("type") != null ? String.valueOf(body.get("type")) : "text";
            String imageUrl = body.get("imageUrl") != null ? String.valueOf(body.get("imageUrl")) : "";
            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if ("image".equalsIgnoreCase(type) && imageUrl.isBlank()) {
                return ResponseEntity.badRequest().body("Image URL is required");
            }

            long now = System.currentTimeMillis();
            String isoDate = java.time.LocalDateTime.now().toString();

            java.util.Map<String, Object> notice = new java.util.HashMap<>();
            notice.put("title", title);
            notice.put("desc", desc);
            notice.put("content", desc);
            notice.put("imageUrl", imageUrl);
            notice.put("created", now);
            notice.put("date", isoDate);
            notice.put("type", type.toLowerCase());

            firebaseService.addNotice(notice).get();
            return ResponseEntity.ok(java.util.Map.of("message", "Notice added"));
        } catch (InterruptedException | ExecutionException e) {
            return ResponseEntity.status(500).body("Error adding notice: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable String id) {
        try {
            firebaseService.deleteNotice(id).get();
            return ResponseEntity.ok(java.util.Map.of("message", "Notice deleted"));
        } catch (InterruptedException | ExecutionException e) {
            return ResponseEntity.status(500).body("Error deleting notice: " + e.getMessage());
        }
    }
}

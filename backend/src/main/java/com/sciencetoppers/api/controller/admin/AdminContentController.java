package com.sciencetoppers.api.controller.admin;

import com.sciencetoppers.api.security.JwtUtil;
import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private JwtUtil jwtUtil;

    /** Resolve which subject this admin owns from their JWT token */
    private String resolveOwner(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        return jwtUtil.extractOwner(token);
    }

    @SuppressWarnings("unchecked")
    private List<String> extractParentPath(Map<String, Object> body) {
        Object raw = body.get("parentPath");
        List<String> result = new ArrayList<>();
        if (raw instanceof List) {
            for (Object segment : (List<Object>) raw) {
                if (segment != null) result.add(String.valueOf(segment));
            }
        }
        return result;
    }

    /**
     * POST /api/admin/content/video
     * Body: { subjectId, sectionId, title, content, type, price, parentPath? }
     * parentPath (optional list of folder names) lets the admin add a video at any depth
     * inside the section's folder tree. Omit or leave empty to add directly under the section.
     */
    @PostMapping("/video")
    public ResponseEntity<?> addVideo(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        String owner = resolveOwner(authHeader);
        String subjectId = (String) body.get("subjectId");

        // Subject-admin enforcement: if owner is set, they can only manage their subject
        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }
        if (subjectId == null || subjectId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "subjectId is required"));
        }

        String sectionId = (String) body.get("sectionId");
        String title     = (String) body.get("title");
        String content   = (String) body.get("content");
        String type      = body.get("type") != null ? String.valueOf(body.get("type")) : "Video";
        String price     = body.get("price") != null ? String.valueOf(body.get("price")) : "f";

        if (sectionId == null || title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "sectionId, title, and content are required"));
        }

        List<String> parentPath = extractParentPath(body);
        firebaseService.addVideoToPath(subjectId, sectionId, parentPath, title, content, type, price).get();
        return ResponseEntity.ok(Map.of("message", "Video added successfully"));
    }

    /**
     * POST /api/admin/content/section
     * Body: { subjectId, sectionName, parentPath? }
     * If parentPath is empty/omitted, creates a top-level section under the subject (existing behavior).
     * If parentPath is provided, creates a sub-folder at that depth inside an existing section.
     * parentPath[0] must be the sectionId the folder lives under; remaining entries are nested folder names.
     */
    @PostMapping("/section")
    public ResponseEntity<?> createSection(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        String owner = resolveOwner(authHeader);
        String subjectId = (String) body.get("subjectId");

        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }
        if (subjectId == null || subjectId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "subjectId is required"));
        }

        String sectionName = (String) body.get("sectionName");
        if (sectionName == null || sectionName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "sectionName is required"));
        }

        List<String> parentPath = extractParentPath(body);

        if (parentPath.isEmpty()) {
            // Top-level section creation — existing behavior
            firebaseService.createSection(subjectId, sectionName).get();
            return ResponseEntity.ok(Map.of("message", "Section created: " + sectionName));
        }

        // Nested sub-folder: parentPath[0] is the sectionId, rest is the nested path within it
        String sectionId = parentPath.get(0);
        List<String> nestedPath = parentPath.size() > 1 ? parentPath.subList(1, parentPath.size()) : new ArrayList<>();

        firebaseService.createSubFolder(subjectId, sectionId, nestedPath, sectionName).get();
        return ResponseEntity.ok(Map.of("message", "Folder created: " + sectionName));
    }

    /**
     * GET /api/admin/content/sections?subjectId=chem
     * Returns sections for the admin's subject (enforced by owner claim).
     */
    @GetMapping("/sections")
    public ResponseEntity<?> getSections(
            @RequestParam String subjectId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        String owner = resolveOwner(authHeader);
        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }

        return ResponseEntity.ok(firebaseService.getSections(subjectId).get());
    }

    /**
     * GET /api/admin/content/videos?subjectId=chem&sectionId=Zoom+videos
     * Returns all videos in a section from pathExtra (admin full view, one level only).
     */
    @GetMapping("/videos")
    public ResponseEntity<?> getVideosInSection(
            @RequestParam String subjectId,
            @RequestParam String sectionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        String owner = resolveOwner(authHeader);
        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }
        return ResponseEntity.ok(firebaseService.getVideosForSection(subjectId, sectionId).get());
    }

    /**
     * PATCH /api/admin/content/video/price
     * Body: { subjectId, sectionId, folderId, videoKey, price }
     * price must be "f" (free) or "p" (paid).
     * Updates only the price field of the video node in Firebase.
     */
    @PatchMapping("/video/price")
    public ResponseEntity<?> updateVideoPrice(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        String owner     = resolveOwner(authHeader);
        String subjectId = (String) body.get("subjectId");

        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }

        String sectionId = (String) body.get("sectionId");
        String folderId  = body.get("folderId") != null ? (String) body.get("folderId") : sectionId;
        String videoKey  = (String) body.get("videoKey");
        String price     = (String) body.get("price");

        if (subjectId == null || sectionId == null || videoKey == null || price == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "subjectId, sectionId, videoKey, and price are required"));
        }
        if (!price.equals("f") && !price.equals("p")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "price must be 'f' (free) or 'p' (paid)"));
        }

        firebaseService.updateVideoPrice(subjectId, sectionId, folderId, videoKey, price).get();
        return ResponseEntity.ok(Map.of("message", "Price updated to " + (price.equals("f") ? "Free" : "Paid")));
    }

    /**
     * DELETE /api/admin/content/video
     * Body: { subjectId, sectionId, folderId, videoKey }
     * Deletes a video/file entirely.
     */
    @DeleteMapping("/video")
    public ResponseEntity<?> deleteVideo(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        String owner     = resolveOwner(authHeader);
        String subjectId = (String) body.get("subjectId");

        if (owner != null && !owner.isBlank() && !owner.equalsIgnoreCase(subjectId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are only allowed to manage subject: " + owner));
        }

        String sectionId = (String) body.get("sectionId");
        String folderId  = body.get("folderId") != null ? (String) body.get("folderId") : sectionId;
        String videoKey  = (String) body.get("videoKey");

        if (subjectId == null || sectionId == null || videoKey == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "subjectId, sectionId, and videoKey are required"));
        }

        try {
            firebaseService.deleteVideo(subjectId, sectionId, folderId, videoKey).get();
            return ResponseEntity.ok(Map.of("message", "Video deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete video: " + e.getMessage()));
        }
    }
}
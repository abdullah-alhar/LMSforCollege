package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.model.VideoItem;
import com.sciencetoppers.api.service.YoutubeProxyService;
import com.sciencetoppers.api.service.FirebaseService;
import com.sciencetoppers.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private YoutubeProxyService youtubeProxyService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/subject/{subjectId}/section/{sectionId}")
    public List<VideoItem> getVideosBySection(
            @PathVariable String subjectId,
            @PathVariable String sectionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        List<VideoItem> videos;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String role = jwtUtil.extractRole(token);

            if ("ADMIN".equalsIgnoreCase(role)) {
                // Admins see all videos from pathExtra (the master content store)
                videos = firebaseService.getVideosForSection(subjectId, sectionId).get();
            } else {
                // Students see only videos from their personal subs array
                String studentId = jwtUtil.extractUsername(token);
                videos = firebaseService.getStudentVideos(studentId, subjectId, sectionId).get();
            }
        } else {
            // Unauthenticated: return from pathExtra (public catalog)
            videos = firebaseService.getVideosForSection(subjectId, sectionId).get();
        }

        // Convert raw YouTube URLs to embed format (pass through for frontend)
        for (VideoItem v : videos) {
            if ("Video".equals(v.getType()) && v.getContent() != null) {
                // Keep original YouTube URL — frontend will convert to embed
                // Only proxy non-YouTube content (e.g. direct mp4 or vimeo)
                if (!v.getContent().contains("youtu")) {
                    v.setContent(youtubeProxyService.getProxiedUrl(v.getContent()));
                }
            }
        }
        return videos;
    }

    @GetMapping("/{videoId}/access")
    public ResponseEntity<?> checkAccess(@PathVariable String videoId, @RequestParam String studentId, @RequestParam String subjectId) {
        boolean hasAccess = firebaseService.hasAccess(studentId, subjectId, videoId);
        if (hasAccess) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).body("No access");
    }

    @GetMapping("/{videoId}/play")
    public ResponseEntity<Map<String, String>> playVideo(
            @PathVariable String videoId,
            @RequestParam String subjectId,
            @RequestParam String sectionId,
            @RequestParam String folder,
            @RequestParam String price,
            @RequestHeader(value = "Authorization", required = false) String authHeader) throws ExecutionException, InterruptedException {

        Map<String, String> response = new HashMap<>();

        // If it's free, skip access checks
        if ("f".equalsIgnoreCase(price) || "free".equalsIgnoreCase(price)) {
            String rawUrl = firebaseService.getRawContentUrl(subjectId, sectionId, folder, videoId).get();
            response.put("status", "allowed");
            response.put("embedUrl", youtubeProxyService.getProxiedUrl(rawUrl));
            return ResponseEntity.ok(response);
        }

        // Paid content requires authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("status", "locked");
            return ResponseEntity.status(401).body(response);
        }

        String token = authHeader.substring(7);
        String role = jwtUtil.extractRole(token);

        if ("ADMIN".equalsIgnoreCase(role)) {
            String rawUrl = firebaseService.getRawContentUrl(subjectId, sectionId, folder, videoId).get();
            response.put("status", "allowed");
            response.put("embedUrl", youtubeProxyService.getProxiedUrl(rawUrl));
            return ResponseEntity.ok(response);
        }

        String studentId = jwtUtil.extractUsername(token);
        String accessStatus = firebaseService.checkStudentSubsAccess(studentId, subjectId, videoId).get();

        response.put("status", accessStatus);

        if ("allowed".equals(accessStatus)) {
            String rawUrl = firebaseService.getRawContentUrl(subjectId, sectionId, folder, videoId).get();
            response.put("embedUrl", youtubeProxyService.getProxiedUrl(rawUrl));
        }

        return ResponseEntity.ok(response);
    }
}

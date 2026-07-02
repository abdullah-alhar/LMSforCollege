package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.model.ContentItem;
import com.sciencetoppers.api.model.Subject;
import com.sciencetoppers.api.model.Section;
import com.sciencetoppers.api.service.FirebaseService;
import com.sciencetoppers.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private JwtUtil jwtUtil;

    /** GET /api/subjects — list all subjects */
    @GetMapping
    public List<Subject> getSubjects() throws ExecutionException, InterruptedException {
        return firebaseService.getSubjects().get();
    }

    /** GET /api/subjects/{subjectId}/sections — list sections for a subject */
    @GetMapping("/{subjectId}/sections")
    public List<Section> getSections(@PathVariable String subjectId)
            throws ExecutionException, InterruptedException {
        return firebaseService.getSections(subjectId).get();
    }

    /**
     * GET /api/subjects/{subjectId}/sections/{sectionId}/folders
     * Returns pathExtra sub-folders for a section.
     */
    @GetMapping("/{subjectId}/sections/{sectionId}/folders")
    public List<Map<String, Object>> getFolders(
            @PathVariable String subjectId,
            @PathVariable String sectionId)
            throws ExecutionException, InterruptedException {
        return firebaseService.getFolders(subjectId, sectionId).get();
    }

    /**
     * GET /api/subjects/{subjectId}/sections/{sectionId}/folders/{folderId}/content
     * Returns content items inside a folder, with accessGranted=true for paid items
     * that the authenticated student has been explicitly granted access to.
     */
    @GetMapping("/{subjectId}/sections/{sectionId}/folders/{folderId}/content")
    public List<ContentItem> getContent(
            @PathVariable String subjectId,
            @PathVariable String sectionId,
            @PathVariable String folderId,
            @RequestHeader(value = "Authorization", required = false) String authHeader)
            throws ExecutionException, InterruptedException {

        List<ContentItem> items = firebaseService.getContentItems(subjectId, sectionId, folderId).get();

        // If student is authenticated, annotate paid items with their access status
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String role = jwtUtil.extractRole(token);
                if ("ADMIN".equalsIgnoreCase(role)) {
                    // Admins always have access to everything
                    items.forEach(item -> item.setAccessGranted(true));
                } else {
                    // Collect IDs of paid items to check in bulk
                    List<String> paidIds = items.stream()
                        .filter(item -> "p".equalsIgnoreCase(item.getPrice()) || "paid".equalsIgnoreCase(item.getPrice()))
                        .map(ContentItem::getId)
                        .collect(Collectors.toList());

                    if (!paidIds.isEmpty()) {
                        String studentId = jwtUtil.extractUsername(token);
                        Set<String> grantedIds = firebaseService.checkBulkAccess(studentId, subjectId, paidIds).get();
                        items.forEach(item -> {
                            if ("p".equalsIgnoreCase(item.getPrice()) || "paid".equalsIgnoreCase(item.getPrice())) {
                                item.setAccessGranted(grantedIds.contains(item.getId()));
                            } else {
                                item.setAccessGranted(true); // free items are always accessible
                            }
                        });
                    } else {
                        // No paid items — all accessible
                        items.forEach(item -> item.setAccessGranted(true));
                    }
                }
            } catch (Exception e) {
                // Token parsing failed — don't annotate access, leave as default (false)
                System.err.println("Failed to parse token for access annotation: " + e.getMessage());
            }
        }

        return items;
    }
}

package com.sciencetoppers.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class AccessControlService {

    @Autowired
    private FirebaseService firebaseService;

    public void grantAccess(String studentId, String subjectId, String videoId, long expiryTimestamp) {
        firebaseService.grantAccess(studentId, subjectId, videoId, expiryTimestamp)
            .exceptionally(ex -> {
                System.err.println("grantAccess write failed: " + ex.getMessage());
                return null;
            });
    }

    public CompletableFuture<Void> grantAccessAsync(String studentId, String subjectId, String videoId, long expiryTimestamp) {
        return firebaseService.grantAccess(studentId, subjectId, videoId, expiryTimestamp);
    }

    public CompletableFuture<Void> revokeAccess(String studentId, String subjectId, String videoId) {
        return firebaseService.revokeAccess(studentId, subjectId, videoId);
    }

    public boolean checkAccess(String studentId, String subjectId, String videoId) {
        return firebaseService.hasAccess(studentId, subjectId, videoId);
    }
}

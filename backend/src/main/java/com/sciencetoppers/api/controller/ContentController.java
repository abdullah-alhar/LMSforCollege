package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping("/quotes")
    public List<String> getQuotes() throws ExecutionException, InterruptedException {
        return firebaseService.getQuotes().get();
    }

    @GetMapping("/notices")
    public List<Map<String, Object>> getNotices() throws ExecutionException, InterruptedException {
        return firebaseService.getNotices().get();
    }

    @GetMapping("/promotions")
    public List<Map<String, Object>> getPromotions() throws ExecutionException, InterruptedException {
        return firebaseService.getPromotions().get();
    }
}

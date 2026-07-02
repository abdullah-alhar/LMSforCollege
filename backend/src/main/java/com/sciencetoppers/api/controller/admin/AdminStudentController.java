package com.sciencetoppers.api.controller.admin;

import com.sciencetoppers.api.dto.AdminCreateStudentRequest;
import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping
    public ResponseEntity<?> listStudents() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> students = firebaseService.getStudents().get();
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody AdminCreateStudentRequest request) {
        // Student creation logic — Firebase Auth creation would go here.
        // For now, return a placeholder acknowledging the request.
        return ResponseEntity.ok(Map.of("message", "Student creation queued", "username", request.getUsername()));
    }
}

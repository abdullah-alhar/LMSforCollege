package com.sciencetoppers.api.service;

import com.sciencetoppers.api.model.User;
import com.sciencetoppers.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private JwtUtil jwtUtil;

    public String login(String username, String password) {
        Optional<User> userOpt = firebaseService.authenticateUser(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getOwner());
        }
        throw new RuntimeException("Invalid credentials");
    }
}

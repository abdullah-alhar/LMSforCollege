package com.sciencetoppers.api.service;

import com.sciencetoppers.api.model.User;
import com.sciencetoppers.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginAuditService loginAuditService;

    @Value("${app.super-admin.index:own}")
    private String superAdminIndex;

    public String login(String username, String password) {
        Optional<User> userOpt = firebaseService.authenticateUser(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean superAdmin = superAdminIndex != null
                    && (superAdminIndex.trim().equalsIgnoreCase(username)
                        || (user.getUsername() != null
                            && user.getUsername().equalsIgnoreCase(superAdminIndex.trim())));
            String webRole = superAdmin ? "SUPER_ADMIN" : user.getRole();
            loginAuditService.record(user.getUsername(), webRole, "LOGIN");
            return jwtUtil.generateToken(
                    user.getUsername(),
                    webRole,
                    superAdmin ? null : user.getOwner());
        }
        throw new RuntimeException("Invalid credentials");
    }
}

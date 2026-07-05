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

    @Autowired
    private WebDeviceService webDeviceService;

    @Value("${app.super-admin.index:own}")
    private String superAdminIndex;

    public String login(
            String username,
            String password,
            String browserId,
            boolean registerBrowser) {
        Optional<User> userOpt = firebaseService.authenticateUser(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            boolean superAdmin = superAdminIndex != null
                    && (superAdminIndex.trim().equalsIgnoreCase(username)
                        || (user.getUsername() != null
                            && user.getUsername().equalsIgnoreCase(superAdminIndex.trim())));
            String webRole = superAdmin ? "SUPER_ADMIN" : user.getRole();

            if (!"ADMIN".equalsIgnoreCase(webRole)
                    && !"SUPER_ADMIN".equalsIgnoreCase(webRole)) {
                WebDeviceService.Access access = registerBrowser
                        ? webDeviceService.registerIfAvailable(
                                user.getUid(), user.getUsername(), browserId)
                        : webDeviceService.check(user.getUid(), browserId);
                if (access == WebDeviceService.Access.REGISTRATION_REQUIRED) {
                    throw new BrowserRegistrationRequiredException();
                }
                if (access == WebDeviceService.Access.DIFFERENT_BROWSER) {
                    throw new DifferentBrowserException();
                }
            }

            loginAuditService.record(user.getUsername(), webRole, "LOGIN");
            return jwtUtil.generateToken(
                    user.getUsername(),
                    webRole,
                    superAdmin ? null : user.getOwner());
        }
        throw new RuntimeException("Invalid credentials");
    }

    public static class BrowserRegistrationRequiredException extends RuntimeException {}
    public static class DifferentBrowserException extends RuntimeException {}
}

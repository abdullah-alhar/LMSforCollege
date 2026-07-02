package com.sciencetoppers.api.security;

import org.springframework.security.access.prepost.PreAuthorize;

// Utility class/annotation wrapper for role checking if needed.
// For now we just rely on @PreAuthorize("hasRole('ADMIN')") etc. in controllers.
public class RoleGuard {
    public static final String STUDENT = "STUDENT";
    public static final String ADMIN = "ADMIN";
    public static final String BIO_ADMIN = "BIO_ADMIN";
    public static final String PHY_ADMIN = "PHY_ADMIN";
    public static final String CHEM_ADMIN = "CHEM_ADMIN";
    public static final String MATH_ADMIN = "MATH_ADMIN";
}

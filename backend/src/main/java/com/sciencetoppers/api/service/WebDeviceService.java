package com.sciencetoppers.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Web-only browser registration stored in the separate science-toppers
 * database. This service never reads or writes the mobile LMS database.
 */
@Service
public class WebDeviceService {

    @Value("${audit.firebase.database.url:https://science-toppers-default-rtdb.firebaseio.com}")
    private String webDatabaseUrl;

    @Autowired
    private RestTemplate restTemplate;

    public enum Access {
        ALLOWED,
        REGISTRATION_REQUIRED,
        DIFFERENT_BROWSER
    }

    @SuppressWarnings("unchecked")
    public Access check(String studentUid, String browserId) {
        validateBrowserId(browserId);
        Object raw = restTemplate.getForObject(registrationUrl(studentUid), Object.class);
        if (!(raw instanceof Map)) {
            return Access.REGISTRATION_REQUIRED;
        }
        Object registeredId = ((Map<String, Object>) raw).get("browserId");
        return browserId.equals(String.valueOf(registeredId))
                ? Access.ALLOWED
                : Access.DIFFERENT_BROWSER;
    }

    /**
     * Claims an unregistered student with Firebase's ETag conditional write.
     * This prevents two browsers registering the same student concurrently.
     */
    @SuppressWarnings("unchecked")
    public Access registerIfAvailable(String studentUid, String username, String browserId) {
        validateBrowserId(browserId);
        String url = registrationUrl(studentUid);

        HttpHeaders readHeaders = new HttpHeaders();
        readHeaders.set("X-Firebase-ETag", "true");
        ResponseEntity<Object> current = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(readHeaders), Object.class);

        if (current.getBody() instanceof Map) {
            Object registeredId = ((Map<String, Object>) current.getBody()).get("browserId");
            return browserId.equals(String.valueOf(registeredId))
                    ? Access.ALLOWED
                    : Access.DIFFERENT_BROWSER;
        }

        long now = System.currentTimeMillis();
        Map<String, Object> registration = new LinkedHashMap<>();
        registration.put("browserId", browserId);
        registration.put("studentUidHash", studentKey(studentUid));
        registration.put("username", username);
        registration.put("registeredAt", now);
        registration.put("registeredDateTime", Instant.ofEpochMilli(now).toString());

        HttpHeaders writeHeaders = new HttpHeaders();
        String etag = current.getHeaders().getETag();
        writeHeaders.set("if-match", etag == null || etag.isBlank() ? "null_etag" : etag);
        try {
            restTemplate.exchange(
                    url, HttpMethod.PUT,
                    new HttpEntity<>(registration, writeHeaders), Object.class);
            return Access.ALLOWED;
        } catch (HttpClientErrorException exception) {
            if (exception.getStatusCode() == HttpStatus.PRECONDITION_FAILED) {
                return check(studentUid, browserId);
            }
            throw exception;
        }
    }

    public void reset(String studentUid) {
        restTemplate.delete(registrationUrl(studentUid));
    }

    private void validateBrowserId(String browserId) {
        if (browserId == null || !browserId.matches("^[a-f0-9]{32}$")) {
            throw new IllegalArgumentException("A valid browser registration ID is required");
        }
    }

    private String registrationUrl(String studentUid) {
        return cleanRoot() + "/webSecurity/browserRegistrations/"
                + studentKey(studentUid) + ".json";
    }

    private String studentKey(String studentUid) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(studentUid.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to secure student identifier", exception);
        }
    }

    private String cleanRoot() {
        return webDatabaseUrl.endsWith("/")
                ? webDatabaseUrl.substring(0, webDatabaseUrl.length() - 1)
                : webDatabaseUrl;
    }
}

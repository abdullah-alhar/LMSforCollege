package com.sciencetoppers.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Stores web authentication audit events only in the separate Firebase
 * database supplied for audit history. It never writes to the LMS/mobile
 * Firebase database.
 */
@Service
public class LoginAuditService {

    @Value("${audit.firebase.database.url:https://science-toppers-default-rtdb.firebaseio.com}")
    private String auditDatabaseUrl;

    @Autowired
    private RestTemplate restTemplate;

    public void record(String username, String role, String event) {
        long timestamp = System.currentTimeMillis();
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("username", username);
        entry.put("role", role);
        entry.put("event", event);
        entry.put("timestamp", timestamp);
        entry.put("dateTime", Instant.ofEpochMilli(timestamp).toString());

        String id = timestamp + "-" + UUID.randomUUID().toString().substring(0, 8);
        String url = cleanRoot() + "/webAudit/loginHistory/" + id + ".json";
        restTemplate.put(url, entry);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> recent() {
        String url = cleanRoot() + "/webAudit/loginHistory.json";
        Object value = restTemplate.getForObject(url, Object.class);
        List<Map<String, Object>> entries = new ArrayList<>();
        if (value instanceof Map) {
            ((Map<String, Object>) value).forEach((id, rawEntry) -> {
                if (rawEntry instanceof Map) {
                    Map<String, Object> entry =
                            new LinkedHashMap<>((Map<String, Object>) rawEntry);
                    entry.put("id", id);
                    entries.add(entry);
                }
            });
        }
        entries.sort(Comparator.comparingLong(this::timestampOf).reversed());
        return entries;
    }

    private long timestampOf(Map<String, Object> entry) {
        Object raw = entry.get("timestamp");
        if (raw instanceof Number) return ((Number) raw).longValue();
        try {
            return Long.parseLong(String.valueOf(raw));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private String cleanRoot() {
        return auditDatabaseUrl.endsWith("/")
                ? auditDatabaseUrl.substring(0, auditDatabaseUrl.length() - 1)
                : auditDatabaseUrl;
    }
}

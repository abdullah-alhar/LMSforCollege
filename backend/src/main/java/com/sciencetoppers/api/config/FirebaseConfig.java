package com.sciencetoppers.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.project.id}")
    private String projectId;

    @Value("${firebase.private.key}")
    private String privateKey;

    @Value("${firebase.client.email}")
    private String clientEmail;

    @Value("${firebase.database.url}")
    private String databaseUrl;

    // private_key_id and client_id are required fields in the service account JSON.
    // They can be any non-empty string for RTDB access; we default to safe placeholders
    // but you should set them to the real values from your service-account JSON.
    @Value("${firebase.private.key.id:key-id-placeholder}")
    private String privateKeyId;

    @Value("${firebase.client.id:000000000000000000000}")
    private String clientId;

    @PostConstruct
    public void init() {
        try {
            if (projectId == null || projectId.isEmpty() ||
                privateKey == null || privateKey.isEmpty() ||
                clientEmail == null || clientEmail.isEmpty() ||
                databaseUrl == null || databaseUrl.isEmpty()) {
                throw new IllegalStateException(
                    "Firebase credentials not set. Ensure FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, " +
                    "FIREBASE_CLIENT_EMAIL and FIREBASE_DATABASE_URL are set."
                );
            }

            // Normalise private key: handle both literal \n and actual newlines
            // We need the key to contain real newlines inside the JSON string
            String normalised = privateKey
                    .replace("\\n", "\n")  // convert escaped \n → real newlines
                    .replace("\r", "");     // strip carriage returns

            // Now re-escape for embedding inside a JSON string value
            String jsonKey = normalised.replace("\n", "\\n");

            String json = "{\n" +
                    "  \"type\": \"service_account\",\n" +
                    "  \"project_id\": \"" + projectId + "\",\n" +
                    "  \"private_key_id\": \"" + privateKeyId + "\",\n" +
                    "  \"private_key\": \"" + jsonKey + "\",\n" +
                    "  \"client_email\": \"" + clientEmail + "\",\n" +
                    "  \"client_id\": \"" + clientId + "\",\n" +
                    "  \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\",\n" +
                    "  \"token_uri\": \"https://oauth2.googleapis.com/token\"\n" +
                    "}";

            InputStream serviceAccount = new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ FirebaseApp initialized — project: " + projectId);
            } else {
                System.out.println("ℹ️  FirebaseApp already initialized.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize FirebaseApp: " + e.getMessage(), e);
        }
    }
}

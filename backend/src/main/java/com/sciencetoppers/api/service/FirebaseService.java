package com.sciencetoppers.api.service;

import com.google.firebase.database.*;
import com.sciencetoppers.api.model.User;
import com.sciencetoppers.api.model.Subject;
import com.sciencetoppers.api.model.Section;
import com.sciencetoppers.api.model.VideoItem;
import com.sciencetoppers.api.model.ContentItem;
import com.sciencetoppers.api.model.PaymentInfo;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class FirebaseService {

    private static final String BASE_PATH = "/new/main";

    // ─── Generic read ────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private <T> CompletableFuture<T> readPath(String path) {
        CompletableFuture<T> future = new CompletableFuture<>();
        try {
            if (com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                future.completeExceptionally(
                        new RuntimeException("Firebase Admin SDK not initialized — missing credentials"));
                return future;
            }
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference(path);
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    future.complete((T) snapshot.getValue());
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    future.completeExceptionally(error.toException());
                }
            });
        } catch (Exception e) {
            future.completeExceptionally(new RuntimeException("Firebase read failed: " + e.getMessage()));
        }
        return future;
    }

    // ─── Write ───────────────────────────────────────────────────────────────

    private CompletableFuture<Void> writePath(String path, Object value) {
        CompletableFuture<Void> future = new CompletableFuture<>();
        try {
            if (com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                future.completeExceptionally(
                        new RuntimeException("Firebase Admin SDK not initialized"));
                return future;
            }
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference(path);
            ref.setValue(value, (error, reference) -> {
                if (error != null) {
                    future.completeExceptionally(error.toException());
                } else {
                    future.complete(null);
                }
            });
        } catch (Exception e) {
            future.completeExceptionally(new RuntimeException("Firebase write failed: " + e.getMessage()));
        }
        return future;
    }

    /**
     * Updates the price field of a video node at:
     *   pathExtra/{subjectId}/{sectionId}/{videoKey}
     * and (if folder differs from section):
     *   pathExtra/{subjectId}/{sectionId}/{folderId}/{videoKey}
     * Uses updateChildren so only the price field is changed.
     */
    public CompletableFuture<Void> updateVideoPrice(
            String subjectId, String sectionId, String folderId, String videoKey, String newPrice) {

        Map<String, Object> update = Collections.singletonMap("price", newPrice);

        // Determine the node path (mirrors the save logic in addVideoToPath)
        boolean isRoot = sectionId.equals(folderId);
        String nodePath = isRoot
                ? BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId + "/" + videoKey
                : BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId + "/" + folderId + "/" + videoKey;

        CompletableFuture<Void> future = new CompletableFuture<>();
        try {
            if (com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                future.completeExceptionally(new RuntimeException("Firebase not initialized"));
                return future;
            }
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference(nodePath);
            ref.updateChildren(update, (error, reference) -> {
                if (error != null) future.completeExceptionally(error.toException());
                else future.complete(null);
            });
        } catch (Exception e) {
            future.completeExceptionally(e);
        }
        return future;
    }

    // ─── Subjects ────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<Subject>> getSubjects() {
        return readPath(BASE_PATH + "/sections").thenApply(value -> {
            List<Subject> subjects = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (String key : map.keySet()) {
                    Subject s = new Subject();
                    s.setId(key);
                    s.setName(key.substring(0, 1).toUpperCase() + key.substring(1).toLowerCase());
                    subjects.add(s);
                }
            }
            return subjects;
        });
    }

    // ─── Sections ────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<Section>> getSections(String subjectId) {
        return readPath(BASE_PATH + "/sections/" + subjectId).thenApply(value -> {
            List<Section> sections = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (String key : map.keySet()) {
                    Section s = new Section();
                    s.setId(key);
                    s.setSubjectId(subjectId);
                    s.setTitle(key);
                    sections.add(s);
                }
            }
            return sections;
        });
    }

    // ─── Folders (pathExtra level) ──────────────────────────────────────────

    /**
     * Returns the sub-folders inside a section from
     * /new/main/pathExtra/{subjectId}/{sectionId}.
     * A node is treated as a "folder" if it has no "content" field (i.e. it is not
     * a direct item).
     * Returns keys as simple strings (the folder IDs).
     */
    public CompletableFuture<List<Map<String, Object>>> getFolders(String subjectId, String sectionId) {
        // Firebase Admin SDK uses raw strings — no URL encoding needed
        String path = BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId;
        return readPath(path).thenApply(value -> {
            List<Map<String, Object>> folders = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (!(entry.getValue() instanceof Map)) {
                        if (entry.getValue() instanceof Boolean) {
                            Map<String, Object> folder = new LinkedHashMap<>();
                            folder.put("id", entry.getKey());
                            folder.put("title", entry.getKey());
                            folders.add(folder);
                        }
                        continue;
                    }
                    Map<String, Object> child = (Map<String, Object>) entry.getValue();
                    // A folder node has no "content" and no "key" — it is just metadata
                    if (child.get("content") == null && child.get("key") == null) {
                        Map<String, Object> folder = new LinkedHashMap<>();
                        folder.put("id", entry.getKey());
                        folder.put("title", getStr(child, "title") != null ? getStr(child, "title") : entry.getKey());
                        folders.add(folder);
                    }
                }
            }
            return folders;
        });
    }

    // ─── Content Items ────────────────────────────────────────────────────────

    /**
     * Extracts a YouTube video ID from various YouTube URL formats.
     * Returns null if the URL is not a YouTube URL.
     */
    private String extractYoutubeId(String url) {
        if (url == null)
            return null;
        // youtu.be/VIDEO_ID
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("youtu\\.be/([A-Za-z0-9_-]{11})").matcher(url);
        if (m.find())
            return m.group(1);
        // youtube.com/watch?v=VIDEO_ID
        m = java.util.regex.Pattern
                .compile("[?&]v=([A-Za-z0-9_-]{11})").matcher(url);
        if (m.find())
            return m.group(1);
        // youtube.com/embed/VIDEO_ID
        m = java.util.regex.Pattern
                .compile("youtube\\.com/embed/([A-Za-z0-9_-]{11})").matcher(url);
        if (m.find())
            return m.group(1);
        // youtube.com/shorts/VIDEO_ID
        m = java.util.regex.Pattern
                .compile("youtube\\.com/shorts/([A-Za-z0-9_-]{11})").matcher(url);
        if (m.find())
            return m.group(1);
        // youtube.com/live/VIDEO_ID
        m = java.util.regex.Pattern
                .compile("youtube\\.com/live/([A-Za-z0-9_-]{11})").matcher(url);
        if (m.find())
            return m.group(1);
        return null;
    }

    /**
     * Maps a raw Firebase map entry to a ContentItem.
     * Thumbnail is computed server-side; raw content URL is kept internally but not
     * included in the DTO (it is returned only by the /play endpoint after access
     * check).
     */
    private ContentItem mapToContentItem(String key, Map<String, Object> itemMap,
            String subjectId, String sectionId, String folder) {
        ContentItem item = new ContentItem();
        item.setId(getStr(itemMap, "key") != null ? getStr(itemMap, "key") : key);
        item.setSubjectId(subjectId);
        item.setSectionId(sectionId);
        item.setFolder(folder);
        item.setTitle(getStr(itemMap, "title"));
        // Normalise type to lowercase
        String rawType = getStr(itemMap, "type");
        item.setType(rawType != null ? rawType.toLowerCase() : "video");
        item.setPrice(getStr(itemMap, "price"));
        // Days field can be stored as String or Long
        Object daysObj = itemMap.get("days");
        item.setDays(daysObj != null ? String.valueOf(daysObj) : "0");
        // Compute YouTube thumbnail server-side
        String contentUrl = getStr(itemMap, "content");
        String ytId = extractYoutubeId(contentUrl);
        if (ytId != null) {
            item.setThumbnailUrl("https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg");
        }
        return item;
    }

    /**
     * Returns content items for a given subject/section/folder.
     */
    public CompletableFuture<List<ContentItem>> getContentItems(
            String subjectId, String sectionId, String folder) {

        // When folder == sectionId the content lives DIRECTLY under
        // pathExtra/{subject}/{section}/ (not a subdirectory with the section name again).
        // When folder != sectionId it lives under pathExtra/{subject}/{section}/{folder}/.
        boolean isRoot = sectionId.equals(folder);
        String pathExtraPath = isRoot
                ? BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId
                : BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId + "/" + folder;

        // Also read from /content/ for any videos written by the old path (kept for backward compatibility)
        String contentPath = isRoot
                ? BASE_PATH + "/content/" + subjectId + "/" + sectionId
                : BASE_PATH + "/content/" + subjectId + "/" + sectionId + "/" + folder;

        CompletableFuture<Object> pathExtraFuture = readPath(pathExtraPath);
        CompletableFuture<Object> contentFuture   = readPath(contentPath);

        return pathExtraFuture.thenCombine(contentFuture, (extraVal, contentVal) -> {
            List<ContentItem> items = new ArrayList<>();
            Set<String> seenKeys = new java.util.HashSet<>();

            // Helper to add an item if it looks like a content item (has 'content' or 'key')
            // and is not just a folder metadata node
            java.util.function.BiConsumer<String, Map<String, Object>> addIfContent = (entryKey, child) -> {
                if (child.get("content") != null || child.get("key") != null) {
                    String id = getStr(child, "key") != null ? getStr(child, "key") : entryKey;
                    if (seenKeys.add(id)) {
                        items.add(mapToContentItem(entryKey, child, subjectId, sectionId, folder));
                    }
                }
            };

            // Process /pathExtra/ first (primary store)
            if (extraVal instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) extraVal;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        addIfContent.accept(entry.getKey(), (Map<String, Object>) entry.getValue());
                    }
                }
            }

            // Process /content/ as fallback (backward compat)
            if (contentVal instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) contentVal;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        addIfContent.accept(entry.getKey(), (Map<String, Object>) entry.getValue());
                    }
                }
            }

            return items;
        });
    }

    /**
     * Checks whether a student has access to a specific content item.
     * Checks the student's subs array/map for an entry matching subjectId + itemId,
     * and also checks the dedicated access node. Returns an enum-like string:
     * "allowed", "locked", or "expired".
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<String> checkStudentSubsAccess(String studentId, String subjectId, String itemId) {
        // First check /new/main/access/{studentId}/{subjectId}/{itemId}
        // Firebase Admin SDK uses raw strings — no URL encoding needed
        String accessPath = BASE_PATH + "/access/" + studentId + "/" + subjectId + "/" + itemId;
        return readPath(accessPath)
                .thenCompose(accessValue -> {
                    if (accessValue instanceof Map) {
                        Map<String, Object> accessData = (Map<String, Object>) accessValue;
                        Object expiry = accessData.get("expiry");
                        if (expiry instanceof Long) {
                            long exp = (Long) expiry;
                            if (exp == 0)
                                return CompletableFuture.completedFuture("allowed");
                            return CompletableFuture.completedFuture(
                                    System.currentTimeMillis() < exp ? "allowed" : "expired");
                        }
                        // No expiry — perpetual access
                        return CompletableFuture.completedFuture("allowed");
                    }
                    // Fall back: check user's subs field
                    return readPath(BASE_PATH + "/users/" + studentId + "/subs").thenApply(subsValue -> {
                        if (subsValue instanceof Map) {
                            Map<String, Object> subsMap = (Map<String, Object>) subsValue;
                            for (Object sub : subsMap.values()) {
                                if (!(sub instanceof Map))
                                    continue;
                                Map<String, Object> subMap = (Map<String, Object>) sub;
                                String subSubject = getStr(subMap, "subject");
                                String subKey = getStr(subMap, "key");
                                if (subjectId.equals(subSubject) && itemId.equals(subKey)) {
                                    // Found — check days-based expiry
                                    Object daysObj = subMap.get("days");
                                    Object createdObj = subMap.get("created");
                                    if (daysObj != null && createdObj instanceof Long) {
                                        try {
                                            long days = Long.parseLong(String.valueOf(daysObj));
                                            long created = (Long) createdObj;
                                            if (days > 0) {
                                                long expiry = created + days * 86_400_000L;
                                                return System.currentTimeMillis() < expiry ? "allowed" : "expired";
                                            }
                                        } catch (NumberFormatException ignored) {
                                        }
                                    }
                                    return "allowed";
                                }
                            }
                        } else if (subsValue instanceof List) {
                            List<Object> subsList = (List<Object>) subsValue;
                            for (Object sub : subsList) {
                                if (!(sub instanceof Map))
                                    continue;
                                Map<String, Object> subMap = (Map<String, Object>) sub;
                                String subSubject = getStr(subMap, "subject");
                                String subKey = getStr(subMap, "key");
                                if (subjectId.equals(subSubject) && itemId.equals(subKey)) {
                                    Object daysObj = subMap.get("days");
                                    Object createdObj = subMap.get("created");
                                    if (daysObj != null && createdObj instanceof Long) {
                                        try {
                                            long days = Long.parseLong(String.valueOf(daysObj));
                                            long created = (Long) createdObj;
                                            if (days > 0) {
                                                long expiry = created + days * 86_400_000L;
                                                return System.currentTimeMillis() < expiry ? "allowed" : "expired";
                                            }
                                        } catch (NumberFormatException ignored) {
                                        }
                                    }
                                    return "allowed";
                                }
                            }
                        }
                        return "locked";
                    });
                });
    }

    /**
     * Returns the raw content URL for a specific item (used only by the /play
     * endpoint).
     * Tries /new/main/content/{subject}/{section}/{folder}/{itemId} first,
     * then /new/main/pathExtra/{subject}/{section}/{itemId}.
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<String> getRawContentUrl(String subjectId, String sectionId,
            String folder, String itemId) {

        // 1. Check content/.../folder/itemId
        String path1 = BASE_PATH + "/content/" + subjectId + "/" + sectionId + "/" + folder + "/" + itemId;
        // 2. Check content/.../itemId (if folder was just the section name)
        String path2 = BASE_PATH + "/content/" + subjectId + "/" + sectionId + "/" + itemId;
        // 3. Check pathExtra/.../folder/itemId
        String path3 = BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId + "/" + folder + "/" + itemId;
        // 4. Check pathExtra/.../itemId
        String path4 = BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId + "/" + itemId;

        return readPath(path1).thenCompose(val1 -> {
            if (val1 instanceof Map) {
                String content = getStr((Map<String, Object>) val1, "content");
                if (content != null)
                    return CompletableFuture.completedFuture(content);
            }
            return readPath(path2).thenCompose(val2 -> {
                if (val2 instanceof Map) {
                    String content = getStr((Map<String, Object>) val2, "content");
                    if (content != null)
                        return CompletableFuture.completedFuture(content);
                }
                return readPath(path3).thenCompose(val3 -> {
                    if (val3 instanceof Map) {
                        String content = getStr((Map<String, Object>) val3, "content");
                        if (content != null)
                            return CompletableFuture.completedFuture(content);
                    }
                    return readPath(path4).thenApply(val4 -> {
                        if (val4 instanceof Map) {
                            return getStr((Map<String, Object>) val4, "content");
                        }
                        return null;
                    });
                });
            });
        });
    }

    // ─── Videos (From Student's Subs) ────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<VideoItem>> getStudentVideos(String studentId, String subjectId, String sectionId) {
        return readPath(BASE_PATH + "/users/" + studentId + "/subs").thenApply(value -> {
            List<VideoItem> videos = new ArrayList<>();
            if (value instanceof List) {
                List<Object> subsList = (List<Object>) value;
                for (Object item : subsList) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        String itemSubject = getStr(itemMap, "subject");
                        String itemSection = getStr(itemMap, "section");
                        if (subjectId.equals(itemSubject) && sectionId.equals(itemSection)) {
                            VideoItem v = new VideoItem();
                            v.setId(getStr(itemMap, "key"));
                            v.setSectionId(itemSection);
                            v.setSubjectId(itemSubject);
                            v.setTitle(getStr(itemMap, "title"));
                            v.setContent(getStr(itemMap, "content"));
                            v.setType(getStr(itemMap, "type"));
                            v.setPrice(getStr(itemMap, "price"));
                            videos.add(v);
                        }
                    }
                }
            } else if (value instanceof Map) {
                Map<String, Object> subsMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : subsMap.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) entry.getValue();
                        String itemSubject = getStr(itemMap, "subject");
                        String itemSection = getStr(itemMap, "section");
                        if (subjectId.equals(itemSubject) && sectionId.equals(itemSection)) {
                            VideoItem v = new VideoItem();
                            v.setId(getStr(itemMap, "key") != null ? getStr(itemMap, "key") : entry.getKey());
                            v.setSectionId(itemSection);
                            v.setSubjectId(itemSubject);
                            v.setTitle(getStr(itemMap, "title"));
                            v.setContent(getStr(itemMap, "content"));
                            v.setType(getStr(itemMap, "type"));
                            v.setPrice(getStr(itemMap, "price"));
                            videos.add(v);
                        }
                    }
                }
            }
            return videos;
        });
    }

    // ─── Payment Info ─────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<PaymentInfo> getPaymentInfo(String subjectId) {
        return readPath(BASE_PATH + "/payments/" + subjectId).thenApply(value -> {
            PaymentInfo info = new PaymentInfo();
            info.setSubjectId(subjectId);
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                info.setAdminName(getStr(map, "adminName"));
                info.setContactNumber(getStr(map, "contactNumber"));
                info.setBankDetails(getStr(map, "bankDetails"));
            }
            return info;
        });
    }

    // ─── Payment Info (admin/global) ──────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<PaymentInfo> getAdminPaymentInfo() {
        return readPath(BASE_PATH + "/payments/admin").thenApply(value -> {
            PaymentInfo info = new PaymentInfo();
            info.setSubjectId("admin");
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                info.setAdminName(getStr(map, "adminName"));
                info.setContactNumber(getStr(map, "contactNumber"));
                info.setBankDetails(getStr(map, "bankDetails"));
            }
            return info;
        });
    }

    // ─── Users / Students ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<Map<String, Object>>> getStudents() {
        return readPath(BASE_PATH + "/users").thenApply(value -> {
            List<Map<String, Object>> students = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> usersMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : usersMap.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> studentData = new LinkedHashMap<>((Map<String, Object>) entry.getValue());
                        studentData.put("uid", entry.getKey());
                        students.add(studentData);
                    }
                }
            }
            return students;
        });
    }

    // ─── Authentication ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<Optional<User>> authenticateUserAsync(String username, String password) {
        return readPath(BASE_PATH + "/users").thenApply(value -> {
            if (value instanceof Map) {
                Map<String, Object> usersMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : usersMap.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> userMap = (Map<String, Object>) entry.getValue();
                        String storedName = getStr(userMap, "name");
                        String storedPassword = getStr(userMap, "pass");
                        String storedIndex = getStr(userMap, "index");

                        // Match by name or index number (which acts as username)
                        boolean usernameMatch = false;
                        if (username != null) {
                            usernameMatch = username.equals(storedName) || username.equals(storedIndex)
                                    || username.equals(entry.getKey());
                        }

                        if (usernameMatch && password.equals(storedPassword)) {
                            User u = new User();
                            u.setUid(entry.getKey());
                            u.setUsername(
                                    storedIndex != null ? storedIndex : storedName != null ? storedName : username);
                            String role = getStr(userMap, "type");
                            u.setRole(role != null ? role.toUpperCase() : "STUDENT");
                            // Include owner subject for subject-admins
                            u.setOwner(getStr(userMap, "owner"));
                            return Optional.of(u);
                        }
                    }
                }
            }
            return Optional.<User>empty();
        });
    }

    // Legacy sync method kept for compatibility — delegates to async
    public Optional<User> authenticateUser(String username, String password) {
        try {
            return authenticateUserAsync(username, password).get();
        } catch (Exception e) {
            System.err.println("Auth lookup failed: " + e.getMessage());
            return Optional.empty();
        }
    }

    // ─── Access Control ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public boolean hasAccess(String studentId, String subjectId, String videoId) {
        try {
            Object value = readPath(BASE_PATH + "/access/" + studentId + "/" + subjectId + "/" + videoId).get();
            if (value instanceof Map) {
                Map<String, Object> accessData = (Map<String, Object>) value;
                Object expiry = accessData.get("expiry");
                if (expiry instanceof Long) {
                    long exp = (Long) expiry;
                    if (exp == 0) return true; // perpetual access
                    return exp > System.currentTimeMillis();
                }
                return true; // no expiry set — grant access
            }
            return false;
        } catch (Exception e) {
            System.err.println("Access check failed: " + e.getMessage());
            return false;
        }
    }

    public CompletableFuture<Void> grantAccess(String studentId, String subjectId, String videoId,
            long expiryTimestamp) {
        Map<String, Object> accessData = new HashMap<>();
        accessData.put("granted", true);
        accessData.put("expiry", expiryTimestamp);
        accessData.put("grantedAt", System.currentTimeMillis());
        String path = BASE_PATH + "/access/" + studentId + "/" + subjectId + "/" + videoId;
        return writePath(path, accessData);
    }

    public CompletableFuture<Void> revokeAccess(String studentId, String subjectId, String videoId) {
        String path = BASE_PATH + "/access/" + studentId + "/" + subjectId + "/" + videoId;
        return writePath(path, null);
    }

    /**
     * Batch access check: reads /access/{studentId}/{subjectId} once and
     * returns the set of video IDs the student is allowed to watch.
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<Set<String>> checkBulkAccess(
            String studentId, String subjectId, List<String> videoIds) {
        String accessBase = BASE_PATH + "/access/" + studentId + "/" + subjectId;
        return readPath(accessBase).thenApply(value -> {
            Set<String> granted = new HashSet<>();
            if (value instanceof Map) {
                Map<String, Object> subjectAccess = (Map<String, Object>) value;
                for (String videoId : videoIds) {
                    Object entry = subjectAccess.get(videoId);
                    if (entry instanceof Map) {
                        Map<String, Object> ad = (Map<String, Object>) entry;
                        Object expiry = ad.get("expiry");
                        if (expiry instanceof Long) {
                            long exp = (Long) expiry;
                            if (exp == 0 || exp > System.currentTimeMillis()) granted.add(videoId);
                        } else {
                            granted.add(videoId); // no expiry field — grant
                        }
                    }
                }
            }
            return granted;
        });
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<String>> getQuotes() {
        return readPath(BASE_PATH + "/quotes").thenApply(value -> {
            List<String> quotes = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (Object v : map.values()) {
                    if (v instanceof String)
                        quotes.add((String) v);
                    else if (v instanceof Map) {
                        String text = getStr((Map<String, Object>) v, "title");
                        if (text != null)
                            quotes.add(text);
                    }
                }
            } else if (value instanceof List) {
                for (Object v : (List<?>) value) {
                    if (v instanceof String)
                        quotes.add((String) v);
                }
            }
            return quotes;
        });
    }

    // ─── Notices ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<Map<String, Object>>> getNotices() {
        return readPath(BASE_PATH + "/notices").thenApply(value -> {
            List<Map<String, Object>> notices = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> notice = new LinkedHashMap<>((Map<String, Object>) entry.getValue());
                        notice.put("id", entry.getKey());
                        notices.add(notice);
                    }
                }
            }
            return notices;
        });
    }

    // ─── Promotions ───────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    public CompletableFuture<List<Map<String, Object>>> getPromotions() {
        return readPath(BASE_PATH + "/promotions").thenApply(value -> {
            List<Map<String, Object>> promos = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> promo = new LinkedHashMap<>((Map<String, Object>) entry.getValue());
                        promo.put("id", entry.getKey());
                        promos.add(promo);
                    }
                }
            }
            return promos;
        });
    }

    // ─── Admin: Content Writing ───────────────────────────────────────────────

    /**
     * Creates a new section folder under sections/{subjectId} and
     * pathExtra/{subjectId}.
     */
    public CompletableFuture<Void> createSection(String subjectId, String sectionName) {
        long now = System.currentTimeMillis();
        Map<String, Object> sectionData = new LinkedHashMap<>();
        sectionData.put("title", sectionName);
        sectionData.put("created", now);
        sectionData.put("date",
                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").format(new java.util.Date(now)));

        // Write to sections/{subjectId}/{sectionName} and
        // pathExtra/{subjectId}/{sectionName}
        CompletableFuture<Void> f1 = writePath(BASE_PATH + "/sections/" + subjectId + "/" + sectionName, sectionData);
        CompletableFuture<Void> f2 = writePath(BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionName, sectionData);
        return CompletableFuture.allOf(f1, f2);
    }

    /**
     * Creates a new sub-folder at an arbitrary depth inside pathExtra.
     * parentPath is a list of folder names from the section down to (but not
     * including)
     * the new folder, e.g. ["Zoom Videos", "Week 1"] creates
     * pathExtra/{subjectId}/{sectionId}/Zoom Videos/Week 1/{folderName}.
     * If parentPath is empty, the folder is created directly under the section.
     */
    public CompletableFuture<Void> createSubFolder(String subjectId, String sectionId,
            List<String> parentPath, String folderName) {
        long now = System.currentTimeMillis();
        Map<String, Object> folderData = new LinkedHashMap<>();
        folderData.put("title", folderName);
        folderData.put("created", now);
        folderData.put("date",
                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").format(new java.util.Date(now)));

        StringBuilder pathBuilder = new StringBuilder(BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId);
        for (String segment : parentPath) {
            pathBuilder.append("/").append(segment);
        }
        pathBuilder.append("/").append(folderName);

        return writePath(pathBuilder.toString(), folderData);
    }

    /**
     * Adds a video entry to pathExtra/{subjectId}/{sectionName}/{key} and
     * appends it into every student's subs array whose subject+section matches.
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<Void> addVideoToSection(String subjectId, String sectionName, String title, String content,
            String type, String price) {
        long now = System.currentTimeMillis();
        // Generate a Firebase-style push key
        String key = "-" + Long.toHexString(now).toUpperCase() + subjectId.substring(0, 1).toUpperCase();

        Map<String, Object> videoData = new LinkedHashMap<>();
        videoData.put("key", key);
        videoData.put("title", title);
        videoData.put("content", content);
        videoData.put("type", type != null ? type : "Video");
        videoData.put("price", price != null ? price : "f");
        videoData.put("subject", subjectId);
        videoData.put("section", sectionName);
        videoData.put("created", now);
        videoData.put("date",
                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").format(new java.util.Date(now)));
        videoData.put("days", "0");

        // 1) Write to pathExtra
        String pathExtraPath = BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionName + "/" + key;
        CompletableFuture<Void> writePathExtra = writePath(pathExtraPath, videoData);

        // 2) Push to every student who has access to this subject
        CompletableFuture<Void> pushToStudents = readPath(BASE_PATH + "/users").thenCompose(value -> {
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> usersMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : usersMap.entrySet()) {
                    if (!(entry.getValue() instanceof Map))
                        continue;
                    Map<String, Object> userMap = (Map<String, Object>) entry.getValue();
                    String userType = getStr(userMap, "type");
                    // Only push to students (not admins)
                    if (!"student".equalsIgnoreCase(userType))
                        continue;

                    // Check if student already has any sub for this subject (optional gating)
                    // For now push to ALL students who belong to same subject via their existing
                    // subs
                    Object subsObj = userMap.get("subs");
                    boolean hasSubjectAccess = false;
                    if (subsObj instanceof List) {
                        for (Object sub : (List<?>) subsObj) {
                            if (sub instanceof Map && subjectId.equals(getStr((Map<String, Object>) sub, "subject"))) {
                                hasSubjectAccess = true;
                                break;
                            }
                        }
                    }
                    if (!hasSubjectAccess)
                        continue;

                    // Append new video to this student's subs list using Firebase push
                    String studentSubsPath = BASE_PATH + "/users/" + entry.getKey() + "/subs";
                    CompletableFuture<Void> pushFuture = new CompletableFuture<>();
                    try {
                        DatabaseReference ref = FirebaseDatabase.getInstance().getReference(studentSubsPath);
                        ref.push().setValue(videoData, (error, reference) -> {
                            if (error != null)
                                pushFuture.completeExceptionally(error.toException());
                            else
                                pushFuture.complete(null);
                        });
                    } catch (Exception e) {
                        pushFuture.complete(null); // don't fail the whole operation
                    }
                    futures.add(pushFuture);
                }
            }
            return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
        });

        return CompletableFuture.allOf(writePathExtra, pushToStudents);
    }

    /**
     * Adds a video entry at an arbitrary depth inside a section's folder tree.
     * parentPath is the list of folder names from the section down to where the
     * video should live.
     * If parentPath is empty, behaves the same as addVideoToSection (video sits
     * directly under the section).
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<Void> addVideoToPath(String subjectId, String sectionId, List<String> parentPath,
            String title, String content, String type, String price) {
        long now = System.currentTimeMillis();
        String key = "-" + Long.toHexString(now).toUpperCase() + subjectId.substring(0, 1).toUpperCase();

        Map<String, Object> videoData = new LinkedHashMap<>();
        videoData.put("key", key);
        videoData.put("title", title);
        videoData.put("content", content);
        videoData.put("type", type != null ? type : "Video");
        videoData.put("price", price != null ? price : "f");
        videoData.put("subject", subjectId);
        videoData.put("section", sectionId);
        videoData.put("created", now);
        videoData.put("date",
                new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").format(new java.util.Date(now)));
        videoData.put("days", "0");

        // Build the correct pathExtra save path:
        // - If parentPath is empty or contains only sectionId => save directly under
        //   pathExtra/{subject}/{section}/{key}  (root of section)
        // - Otherwise append each segment that is NOT the sectionId as a subfolder
        StringBuilder pathBuilder = new StringBuilder(BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId);
        if (parentPath != null) {
            for (String segment : parentPath) {
                if (!segment.equals(sectionId)) {
                    pathBuilder.append("/").append(segment);
                }
            }
        }
        pathBuilder.append("/").append(key);

        CompletableFuture<Void> writePathExtra = writePath(pathBuilder.toString(), videoData);

        // Same student-push logic as addVideoToSection, kept identical for consistency
        CompletableFuture<Void> pushToStudents = readPath(BASE_PATH + "/users").thenCompose(value -> {
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> usersMap = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : usersMap.entrySet()) {
                    if (!(entry.getValue() instanceof Map))
                        continue;
                    Map<String, Object> userMap = (Map<String, Object>) entry.getValue();
                    String userType = getStr(userMap, "type");
                    if (!"student".equalsIgnoreCase(userType))
                        continue;

                    Object subsObj = userMap.get("subs");
                    boolean hasSubjectAccess = false;
                    if (subsObj instanceof List) {
                        for (Object sub : (List<?>) subsObj) {
                            if (sub instanceof Map && subjectId.equals(getStr((Map<String, Object>) sub, "subject"))) {
                                hasSubjectAccess = true;
                                break;
                            }
                        }
                    }
                    if (!hasSubjectAccess)
                        continue;

                    String studentSubsPath = BASE_PATH + "/users/" + entry.getKey() + "/subs";
                    CompletableFuture<Void> pushFuture = new CompletableFuture<>();
                    try {
                        DatabaseReference ref = FirebaseDatabase.getInstance().getReference(studentSubsPath);
                        ref.push().setValue(videoData, (error, reference) -> {
                            if (error != null)
                                pushFuture.completeExceptionally(error.toException());
                            else
                                pushFuture.complete(null);
                        });
                    } catch (Exception e) {
                        pushFuture.complete(null);
                    }
                    futures.add(pushFuture);
                }
            }
            return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
        });

        return CompletableFuture.allOf(writePathExtra, pushToStudents);
    }

    /**
     * Gets all video items in a section from pathExtra (for admin view and general
     * browsing).
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<List<VideoItem>> getVideosForSection(String subjectId, String sectionId) {
        return readPath(BASE_PATH + "/pathExtra/" + subjectId + "/" + sectionId).thenApply(value -> {
            List<VideoItem> videos = new ArrayList<>();
            if (value instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) value;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    if (entry.getValue() instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) entry.getValue();
                        // Skip folder-level metadata entries (only have title/created/date)
                        if (itemMap.get("content") == null && itemMap.get("key") == null)
                            continue;
                        VideoItem v = new VideoItem();
                        v.setId(getStr(itemMap, "key") != null ? getStr(itemMap, "key") : entry.getKey());
                        v.setSectionId(sectionId);
                        v.setSubjectId(subjectId);
                        v.setTitle(getStr(itemMap, "title"));
                        v.setContent(getStr(itemMap, "content"));
                        v.setType(getStr(itemMap, "type"));
                        v.setPrice(getStr(itemMap, "price"));
                        videos.add(v);
                    }
                }
            }
            return videos;
        });
    }

    /**
     * Gets all video items across all sections for a specific subject (for admin
     * access grant dropdown).
     * Needs to fetch from both /pathExtra and /content because videos can be in
     * either location.
     */
    @SuppressWarnings("unchecked")
    public CompletableFuture<List<VideoItem>> getVideosForSubject(String subjectId) {
        CompletableFuture<Object> pathExtraFuture = readPath(BASE_PATH + "/pathExtra/" + subjectId);
        CompletableFuture<Object> contentFuture = readPath(BASE_PATH + "/content/" + subjectId);

        return pathExtraFuture.thenCombine(contentFuture, (pathExtraValue, contentValue) -> {
            List<VideoItem> videos = new ArrayList<>();
            Set<String> addedKeys = new HashSet<>(); // To avoid duplicates

            // 1. Process /pathExtra/{subjectId}
            if (pathExtraValue instanceof Map) {
                Map<String, Object> sectionsMap = (Map<String, Object>) pathExtraValue;
                for (Map.Entry<String, Object> sectionEntry : sectionsMap.entrySet()) {
                    String sectionId = sectionEntry.getKey();
                    if (sectionEntry.getValue() instanceof Map) {
                        Map<String, Object> map = (Map<String, Object>) sectionEntry.getValue();
                        for (Map.Entry<String, Object> entry : map.entrySet()) {
                            if (entry.getValue() instanceof Map) {
                                Map<String, Object> itemOrFolderMap = (Map<String, Object>) entry.getValue();
                                if (itemOrFolderMap.get("content") != null || itemOrFolderMap.get("key") != null) {
                                    VideoItem v = mapToVideoItem(itemOrFolderMap, entry.getKey(), subjectId, sectionId);
                                    if (addedKeys.add(v.getId()))
                                        videos.add(v);
                                }
                            }
                        }
                    }
                }
            }

            // 2. Process /content/{subjectId}
            if (contentValue instanceof Map) {
                Map<String, Object> sectionsMap = (Map<String, Object>) contentValue;
                for (Map.Entry<String, Object> sectionEntry : sectionsMap.entrySet()) {
                    String sectionId = sectionEntry.getKey();
                    if (sectionEntry.getValue() instanceof Map) {
                        Map<String, Object> foldersOrItems = (Map<String, Object>) sectionEntry.getValue();
                        for (Map.Entry<String, Object> entry : foldersOrItems.entrySet()) {
                            if (entry.getValue() instanceof Map) {
                                Map<String, Object> mapVal = (Map<String, Object>) entry.getValue();
                                // Check if this is directly an item
                                if (mapVal.get("content") != null || mapVal.get("key") != null) {
                                    VideoItem v = mapToVideoItem(mapVal, entry.getKey(), subjectId, sectionId);
                                    if (addedKeys.add(v.getId()))
                                        videos.add(v);
                                } else {
                                    // It's a folder containing items
                                    for (Map.Entry<String, Object> itemEntry : mapVal.entrySet()) {
                                        if (itemEntry.getValue() instanceof Map) {
                                            Map<String, Object> itemMap = (Map<String, Object>) itemEntry.getValue();
                                            if (itemMap.get("content") != null || itemMap.get("key") != null) {
                                                VideoItem v = mapToVideoItem(itemMap, itemEntry.getKey(), subjectId,
                                                        sectionId);
                                                if (addedKeys.add(v.getId()))
                                                    videos.add(v);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return videos;
        });
    }

    private VideoItem mapToVideoItem(Map<String, Object> itemMap, String fallbackKey, String subjectId,
            String sectionId) {
        VideoItem v = new VideoItem();
        v.setId(getStr(itemMap, "key") != null ? getStr(itemMap, "key") : fallbackKey);
        v.setSectionId(sectionId);
        v.setSubjectId(subjectId);
        v.setTitle(getStr(itemMap, "title"));
        v.setContent(getStr(itemMap, "content"));
        v.setType(getStr(itemMap, "type"));
        v.setPrice(getStr(itemMap, "price"));
        return v;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String getStr(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val instanceof String ? (String) val : null;
    }
}
package com.sciencetoppers.api.model;

/**
 * Represents a single content item (video, file, quiz, text) returned to the frontend.
 * The raw YouTube URL is NEVER included here for paid content.
 * thumbnailUrl is computed server-side from the videoId.
 */
public class ContentItem {
    private String id;
    private String subjectId;
    private String sectionId;
    private String folder;      // pathExtra key
    private String title;
    private String type;        // "video", "file", "quiz", "text"
    private String price;       // "f" = free, "p" = paid
    private String thumbnailUrl; // YouTube thumbnail URL (computed server-side)
    private String days;        // number of days access lasts (for paid)
    private boolean accessGranted; // true if this student has been explicitly granted access (paid items only)
    // content URL is intentionally omitted from this DTO —
    // it is only returned by /api/video/{videoId}/play after access check

    public String getId()           { return id; }
    public void setId(String id)    { this.id = id; }

    public String getSubjectId()              { return subjectId; }
    public void setSubjectId(String subjectId){ this.subjectId = subjectId; }

    public String getSectionId()               { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }

    public String getFolder()             { return folder; }
    public void setFolder(String folder)  { this.folder = folder; }

    public String getTitle()              { return title; }
    public void setTitle(String title)    { this.title = title; }

    public String getType()               { return type; }
    public void setType(String type)      { this.type = type; }

    public String getPrice()              { return price; }
    public void setPrice(String price)    { this.price = price; }

    public String getThumbnailUrl()                   { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl)  { this.thumbnailUrl = thumbnailUrl; }

    public String getDays()               { return days; }
    public void setDays(String days)      { this.days = days; }

    public boolean isAccessGranted()                    { return accessGranted; }
    public void setAccessGranted(boolean accessGranted) { this.accessGranted = accessGranted; }
}

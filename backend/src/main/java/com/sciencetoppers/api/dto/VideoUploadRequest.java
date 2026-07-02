package com.sciencetoppers.api.dto;

public class VideoUploadRequest {
    private String subjectId;
    private String sectionId;
    private String folderId;
    private String title;
    private String url;
    private String price; // f or p
    
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    
    public String getFolderId() { return folderId; }
    public void setFolderId(String folderId) { this.folderId = folderId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
}

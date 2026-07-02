package com.sciencetoppers.api.model;

public class VideoItem {
    private String id;
    private String sectionId;
    private String subjectId;
    private String title;
    private String type; // Video, Text, Quiz
    private String price; // f = free, p = paid
    private String content; // video url or text content
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
    
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

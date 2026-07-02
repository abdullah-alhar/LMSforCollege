package com.sciencetoppers.api.model;

public class Subscription {
    private String studentId;
    private String subjectId;
    private String videoId; // if specific, or null if subject-wide
    private long expiryTimestamp;
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
    
    public String getVideoId() { return videoId; }
    public void setVideoId(String videoId) { this.videoId = videoId; }
    
    public long getExpiryTimestamp() { return expiryTimestamp; }
    public void setExpiryTimestamp(long expiryTimestamp) { this.expiryTimestamp = expiryTimestamp; }
}

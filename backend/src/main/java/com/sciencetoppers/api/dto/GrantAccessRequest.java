package com.sciencetoppers.api.dto;

public class GrantAccessRequest {
    private String studentId;
    private String subjectId;
    private String videoId;
    private int days;              // number of days from grant date; 0 = perpetual / no expiry
    private long expiryTimestamp;  // optional absolute override, kept for manual/legacy use

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getVideoId() { return videoId; }
    public void setVideoId(String videoId) { this.videoId = videoId; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public long getExpiryTimestamp() { return expiryTimestamp; }
    public void setExpiryTimestamp(long expiryTimestamp) { this.expiryTimestamp = expiryTimestamp; }
}
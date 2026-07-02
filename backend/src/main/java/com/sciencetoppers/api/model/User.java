package com.sciencetoppers.api.model;

public class User {
    private String uid;
    private String username;
    private String role; // "student", "admin"
    private String owner; // for admins: "chem", "bio", "phy", "math"
    
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
}

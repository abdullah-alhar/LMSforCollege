package com.sciencetoppers.api.dto;

public class AdminCreateStudentRequest {
    private String username;
    private String password;
    private String index;
    private String role;

    public String getUsername()  { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword()  { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getIndex()     { return index; }
    public void setIndex(String index) { this.index = index; }

    public String getRole()      { return role != null ? role : "STUDENT"; }
    public void setRole(String role) { this.role = role; }
}

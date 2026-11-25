package com.textile.salesorder.dto;

public record AuthResponse(String token, String username, String role) {
}
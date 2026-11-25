package com.textile.salesorder.dto;

public record ResetPasswordRequest(String token, String newPassword) {
}
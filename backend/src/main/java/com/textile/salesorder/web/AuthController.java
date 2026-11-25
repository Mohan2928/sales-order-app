package com.textile.salesorder.web;

import com.textile.salesorder.domain.PasswordResetToken;
import com.textile.salesorder.domain.User;
import com.textile.salesorder.dto.*;
import com.textile.salesorder.repository.PasswordResetTokenRepository;
import com.textile.salesorder.repository.UserRepository;
import com.textile.salesorder.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordResetTokenRepository resetTokens,
                          PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.resetTokens = resetTokens;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        User user = users.findByUsername(request.username())
                .filter(u -> encoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        String token = jwt.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole());
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        // Stateless JWT: the client discards the token. No server state to clear.
        return Map.of("message", "Logged out");
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        User user = users.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(user);
        prt.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        prt.setUsed(false);
        resetTokens.save(prt);
        // No email server configured: return the token so it can be used in dev.
        return new ForgotPasswordResponse(token);
    }

    @PostMapping("/reset-password")
    @Transactional
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        PasswordResetToken prt = resetTokens.findByToken(request.token())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token"));
        if (prt.isUsed() || prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expired or already used");
        }
        User user = prt.getUser();
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
        prt.setUsed(true);
        resetTokens.save(prt);
        return Map.of("message", "Password reset successful");
    }
}
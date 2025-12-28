package com.globetrotter.globetrotterbackend.controller;

import com.globetrotter.globetrotterbackend.dto.AuthResponse;
import com.globetrotter.globetrotterbackend.dto.LoginRequest;
import com.globetrotter.globetrotterbackend.model.User;
import com.globetrotter.globetrotterbackend.security.JwtTokenProvider;
import com.globetrotter.globetrotterbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userService.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest().body(createError("Username is already taken"));
            }

            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body(createError("Email is already registered"));
            }

            User registeredUser = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(
                    null,
                    registeredUser.getUsername(),
                    registeredUser.getEmail(),
                    registeredUser.getRole().toString(),
                    "User registered successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

            if (user.isLocked()) {
                if (user.getLockTime() != null &&
                        LocalDateTime.now().isAfter(user.getLockTime().plusMinutes(15))) {
                    user.unlock();
                    userService.save(user);
                } else {
                    throw new LockedException("Account is locked. Try again later.");
                }
            }

            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getUsername(),
                                loginRequest.getPassword()
                        )
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);

                user.resetFailedAttempts();
                user.setLastLogin(LocalDateTime.now());
                userService.save(user);

                String token = tokenProvider.generateToken(authentication);

                return ResponseEntity.ok(new AuthResponse(
                        token,
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().toString(),
                        "Login successful"
                ));

            } catch (BadCredentialsException e) {
                user.incrementFailedAttempts();

                if (user.getFailedLoginAttempts() >= 5) {
                    user.lock();
                    userService.save(user);
                    throw new LockedException("Account locked. Try again in 15 minutes.");
                }

                userService.save(user);
                throw new BadCredentialsException("Invalid username or password");
            }

        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(createError(e.getMessage()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createError("Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError("An error occurred during login"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createError("Not authenticated"));
            }

            String username = authentication.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of(
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole().toString(),
                    "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                    "lastName", user.getLastName() != null ? user.getLastName() : ""
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError("Failed to get user information"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Auth service is running");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String newPassword = request.get("newPassword");

            if (username == null || newPassword == null) {
                return ResponseEntity.badRequest().body(createError("Username and newPassword are required"));
            }

            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setPassword(passwordEncoder.encode(newPassword));
            userService.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset successfully for user: " + username);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createError(e.getMessage()));
        }
    }

    private Map<String, Object> createError(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
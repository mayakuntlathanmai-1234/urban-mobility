package com.urbanride.auth.controller;

import com.urbanride.auth.entity.User;
import com.urbanride.auth.repository.UserRepository;
import com.urbanride.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            Map<String, Object> result = authService.login(email, password);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String password = body.get("password");
            String phone = body.get("phone");
            String role = body.get("role");
            Map<String, Object> result = authService.register(name, email, password, phone, role);
            return ResponseEntity.status(201).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestParam(required = false) String email) {
        if (email == null) return ResponseEntity.status(400).body(Map.of("error", "Email parameter required"));
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        return ResponseEntity.ok(Map.of("user", user));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "AUTH-SERVICE"));
    }
}

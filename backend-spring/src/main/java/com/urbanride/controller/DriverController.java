package com.urbanride.controller;

import com.urbanride.dto.LocationUpdateRequest;
import com.urbanride.dto.StatusUpdateRequest;
import com.urbanride.entity.Driver;
import com.urbanride.security.JwtUtil;
import com.urbanride.service.DriverService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody StatusUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String userId = jwtUtil.extractUserId(token);
            String driverId = jwtUtil.extractDriverId(token);

            Driver driver;
            if (driverId != null) {
                driver = driverService.updateStatus(driverId, Boolean.TRUE.equals(request.getIsOnline()));
            } else {
                Driver d = driverService.getDriverByUserId(userId);
                driver = driverService.updateStatus(d.getId(), Boolean.TRUE.equals(request.getIsOnline()));
            }

            return ResponseEntity.ok(Map.of("message", "Driver status updated", "driver", driver));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(@RequestBody LocationUpdateRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String userId = jwtUtil.extractUserId(token);
            String driverId = jwtUtil.extractDriverId(token);

            if (request.getLatitude() == null || request.getLongitude() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Latitude and longitude required"));
            }

            Driver driver;
            if (driverId != null) {
                driver = driverService.updateLocation(driverId, request.getLatitude(), request.getLongitude());
            } else {
                Driver d = driverService.getDriverByUserId(userId);
                driver = driverService.updateLocation(d.getId(), request.getLatitude(), request.getLongitude());
            }

            return ResponseEntity.ok(Map.of("message", "Location updated", "location", Map.of("latitude", driver.getCurrentLat(), "longitude", driver.getCurrentLng())));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyDrivers() {
        try {
            List<Driver> drivers = driverService.getNearbyDrivers();
            return ResponseEntity.ok(Map.of("drivers", drivers));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String userId = jwtUtil.extractUserId(token);
            String driverId = jwtUtil.extractDriverId(token);

            Map<String, Object> stats = driverService.getDashboardStats(userId, driverId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

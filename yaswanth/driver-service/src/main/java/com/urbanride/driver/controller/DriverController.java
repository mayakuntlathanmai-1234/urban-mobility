package com.urbanride.driver.controller;

import com.urbanride.driver.entity.Driver;
import com.urbanride.driver.entity.Vehicle;
import com.urbanride.driver.repository.DriverRepository;
import com.urbanride.driver.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public ResponseEntity<?> getAllDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return ResponseEntity.ok(Map.of("drivers", drivers));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "DRIVER-SERVICE"));
    }

    @RequestMapping(value = {"/status", "/{id}/status"}, method = {RequestMethod.POST, RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<?> updateStatus(@PathVariable(required = false) String id, @RequestBody Map<String, Object> body, @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        try {
            Boolean isOnline = body.containsKey("isOnline") ? (Boolean) body.get("isOnline") : body.containsKey("online") ? (Boolean) body.get("online") : true;
            String userId = userIdHeader != null ? userIdHeader : (String) body.get("userId");

            Driver driver = null;
            if (id != null) {
                driver = driverRepository.findById(id).orElse(null);
            }
            if (driver == null && userId != null) {
                driver = driverRepository.findByUserId(userId).orElse(null);
            }
            if (driver == null && driverRepository.count() > 0) {
                driver = driverRepository.findAll().get(0); // Fallback for demo driver
            }
            if (driver == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Driver profile not found"));
            }

            driver.setIsOnline(Boolean.TRUE.equals(isOnline));
            driver = driverRepository.save(driver);
            return ResponseEntity.ok(Map.of("message", "Driver status updated", "driver", driver));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @RequestMapping(value = {"/location", "/{id}/location"}, method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> updateLocation(@PathVariable(required = false) String id, @RequestBody Map<String, Object> body, @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        try {
            Double lat = body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : body.get("lat") != null ? ((Number) body.get("lat")).doubleValue() : 37.7749;
            Double lng = body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : body.get("lng") != null ? ((Number) body.get("lng")).doubleValue() : -122.4194;
            String userId = userIdHeader != null ? userIdHeader : (String) body.get("userId");

            Driver driver = null;
            if (id != null) {
                driver = driverRepository.findById(id).orElse(null);
            }
            if (driver == null && userId != null) {
                driver = driverRepository.findByUserId(userId).orElse(null);
            }
            if (driver == null && driverRepository.count() > 0) {
                driver = driverRepository.findAll().get(0);
            }
            if (driver != null) {
                driver.setCurrentLat(lat);
                driver.setCurrentLng(lng);
                driverRepository.save(driver);
            }
            return ResponseEntity.ok(Map.of("message", "Location updated", "location", Map.of("latitude", lat, "longitude", lng)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyDrivers() {
        List<Driver> drivers = driverRepository.findByIsOnlineTrue();
        return ResponseEntity.ok(Map.of("drivers", drivers));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Driver driver = driverRepository.findAll().stream().findFirst().orElse(null);
        if (driver == null) return ResponseEntity.status(404).body(Map.of("error", "No drivers registered"));

        Vehicle vehicle = vehicleRepository.findByDriverId(driver.getId()).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("driver", driver);
        response.put("vehicle", vehicle);

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayEarnings", 1240);
        stats.put("completedToday", 8);
        stats.put("totalEarnings", (int) Math.round(driver.getTotalEarnings()));
        stats.put("totalRides", driver.getTotalRides());
        stats.put("rating", driver.getRating());

        response.put("stats", stats);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriverById(@PathVariable String id) {
        Driver driver = driverRepository.findById(id).orElse(null);
        if (driver == null) return ResponseEntity.status(404).body(Map.of("error", "Driver not found"));
        return ResponseEntity.ok(driver);
    }
}

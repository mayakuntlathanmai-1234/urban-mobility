package com.urbanride.controller;

import com.urbanride.dto.CancelRideRequest;
import com.urbanride.dto.CreateRideRequest;
import com.urbanride.dto.EstimateRequest;
import com.urbanride.entity.Ride;
import com.urbanride.repository.RideRepository;

import com.urbanride.security.JwtUtil;
import com.urbanride.service.FareService;
import com.urbanride.service.RideService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private FareService fareService;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @PostMapping("/estimate")
    public ResponseEntity<?> estimateFare(@RequestBody EstimateRequest request) {
        try {
            if (request.getPickupLat() == null || request.getPickupLng() == null ||
                request.getDestLat() == null || request.getDestLng() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Pickup and Destination coordinates required"));
            }

            double distanceKm = rideService.calculateHaversineDistance(
                    request.getPickupLat(), request.getPickupLng(),
                    request.getDestLat(), request.getDestLng()
            );
            int estimatedTimeMin = Math.max(5, (int) Math.round((distanceKm / 30.0) * 60));
            var estimates = fareService.getAllFareEstimates(distanceKm, estimatedTimeMin);

            Map<String, Object> response = new HashMap<>();
            response.put("distanceKm", Math.round(distanceKm * 10.0) / 10.0);
            response.put("estimatedTimeMin", estimatedTimeMin);
            response.put("estimates", estimates);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createRide(@RequestBody CreateRideRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String passengerId = jwtUtil.extractUserId(token);

            Ride ride = rideService.createRide(passengerId, request);

            return ResponseEntity.status(201).body(Map.of(
                    "message", "Ride request created, searching for nearby drivers...",
                    "ride", ride
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create ride request", "details", e.getMessage()));
        }
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRide(@PathVariable String id, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            String driverUserId = jwtUtil.extractUserId(token);
            String driverProfileId = jwtUtil.extractDriverId(token);

            Ride ride = rideService.acceptRide(id, driverUserId, driverProfileId);
            return ResponseEntity.ok(Map.of("message", "Ride accepted successfully", "ride", ride));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/arrive")
    public ResponseEntity<?> markArrived(@PathVariable String id) {
        try {
            Ride ride = rideService.markArrived(id);
            return ResponseEntity.ok(Map.of("message", "Driver marked as arrived", "ride", ride));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> startRide(@PathVariable String id) {
        try {
            Ride ride = rideService.startRide(id);
            return ResponseEntity.ok(Map.of("message", "Ride started", "ride", ride));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeRide(@PathVariable String id) {
        try {
            Ride ride = rideService.completeRide(id);
            return ResponseEntity.ok(Map.of("message", "Ride completed successfully", "ride", ride));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRide(@PathVariable String id, @RequestBody(required = false) CancelRideRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            String role = token != null ? jwtUtil.extractRole(token) : "PASSENGER";
            boolean isDriver = "DRIVER".equalsIgnoreCase(role);

            String reason = request != null ? request.getReason() : null;
            Ride ride = rideService.cancelRide(id, reason, isDriver);
            return ResponseEntity.ok(Map.of("message", "Ride cancelled", "ride", ride));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRide(@PathVariable String id) {
        Ride ride = rideRepository.findById(id).orElse(null);
        if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));
        return ResponseEntity.ok(Map.of("ride", ride));
    }

    @GetMapping
    public ResponseEntity<?> listRides(HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

            String userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);
            String driverId = jwtUtil.extractDriverId(token);

            List<Ride> rides = rideService.listRides(userId, role, driverId);
            return ResponseEntity.ok(Map.of("rides", rides));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

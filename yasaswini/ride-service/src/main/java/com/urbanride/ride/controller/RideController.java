package com.urbanride.ride.controller;

import com.urbanride.ride.entity.Ride;
import com.urbanride.ride.enums.RideStatus;
import com.urbanride.ride.repository.RideRepository;
import com.urbanride.ride.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private RideRepository rideRepository;

    @PostMapping("/estimate")
    public ResponseEntity<?> estimateFare(@RequestBody Map<String, Object> body) {
        try {
            Double pickupLat = ((Number) body.get("pickupLat")).doubleValue();
            Double pickupLng = ((Number) body.get("pickupLng")).doubleValue();
            Double destLat = ((Number) body.get("destLat")).doubleValue();
            Double destLng = ((Number) body.get("destLng")).doubleValue();

            double distanceKm = rideService.calculateHaversineDistance(pickupLat, pickupLng, destLat, destLng);
            int estimatedTimeMin = Math.max(5, (int) Math.round((distanceKm / 30.0) * 60));

            Map<String, Map<String, Object>> estimates = new HashMap<>();
            estimates.put("BIKE", Map.of("baseFare", 30.0, "perKmFare", 10.0, "estimatedFare", Math.round(30 + distanceKm * 10)));
            estimates.put("AUTO", Map.of("baseFare", 40.0, "perKmFare", 14.0, "estimatedFare", Math.round(40 + distanceKm * 14)));
            estimates.put("SEDAN", Map.of("baseFare", 60.0, "perKmFare", 18.0, "estimatedFare", Math.round(60 + distanceKm * 18)));
            estimates.put("SUV", Map.of("baseFare", 80.0, "perKmFare", 22.0, "estimatedFare", Math.round(80 + distanceKm * 22)));

            return ResponseEntity.ok(Map.of(
                    "distanceKm", Math.round(distanceKm * 10.0) / 10.0,
                    "estimatedTimeMin", estimatedTimeMin,
                    "estimates", estimates
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createRide(@RequestBody Map<String, Object> body, @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            Ride ride = rideService.createRide(userId, body);
            return ResponseEntity.status(201).body(Map.of(
                    "message", "Ride request created, searching for nearby drivers...",
                    "ride", ride
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DRIVER ACCEPTANCE WITH ATOMIC CONCURRENCY CHECK
     * Returns 200 OK for winning driver.
     * Returns 409 CONFLICT if another driver already claimed the ride.
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRide(@PathVariable String id, @RequestBody(required = false) Map<String, String> body, @RequestHeader(value = "X-Driver-Id", required = false) String driverIdHeader) {
        try {
            String driverId = driverIdHeader;
            if (driverId == null && body != null) {
                driverId = body.get("driverId");
            }
            if (driverId == null) {
                driverId = "driver-default";
            }

            Ride ride = rideService.acceptRideAtomic(id, driverId);
            return ResponseEntity.ok(Map.of("message", "Ride accepted successfully", "ride", ride));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
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

    @GetMapping("/{id}")
    public ResponseEntity<?> getRide(@PathVariable String id) {
        Ride ride = rideRepository.findById(id).orElse(null);
        if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));
        return ResponseEntity.ok(Map.of("ride", ride));
    }

    @GetMapping
    public ResponseEntity<?> listRides() {
        List<Ride> rides = rideRepository.findAllByOrderByRequestedAtDesc();
        return ResponseEntity.ok(Map.of("rides", rides));
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableRides() {
        List<RideStatus> statuses = Arrays.asList(RideStatus.WAITING_FOR_DRIVER, RideStatus.SEARCHING_DRIVER);
        List<Ride> rides = rideRepository.findByStatusInOrderByRequestedAtDesc(statuses);
        return ResponseEntity.ok(Map.of("rides", rides));
    }
}

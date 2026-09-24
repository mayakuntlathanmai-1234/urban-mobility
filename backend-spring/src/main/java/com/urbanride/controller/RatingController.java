package com.urbanride.controller;

import com.urbanride.dto.RatingRequest;
import com.urbanride.entity.Driver;
import com.urbanride.entity.Rating;
import com.urbanride.entity.Ride;
import com.urbanride.repository.DriverRepository;
import com.urbanride.repository.RatingRepository;
import com.urbanride.repository.RideRepository;
import com.urbanride.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> submitRating(@RequestBody RatingRequest request, HttpServletRequest httpRequest) {
        try {
            String token = extractToken(httpRequest);
            if (token == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            String passengerId = jwtUtil.extractUserId(token);

            Ride ride = rideRepository.findById(request.getRideId()).orElse(null);
            if (ride == null) return ResponseEntity.status(404).body(Map.of("error", "Ride not found"));

            String driverId = ride.getDriver() != null ? ride.getDriver().getId() : null;
            if (driverId == null) return ResponseEntity.badRequest().body(Map.of("error", "No driver assigned to ride"));

            Rating rating = Rating.builder()
                    .rideId(ride.getId())
                    .passengerId(passengerId)
                    .driverId(driverId)
                    .stars(request.getStars())
                    .comment(request.getComment())
                    .build();
            rating = ratingRepository.save(rating);

            // Update driver average rating
            List<Rating> ratings = ratingRepository.findByDriverId(driverId);
            double avgRating = ratings.stream().mapToInt(Rating::getStars).average().orElse(4.8);

            Driver driver = driverRepository.findById(driverId).orElse(null);
            if (driver != null) {
                driver.setRating(Math.round(avgRating * 10.0) / 10.0);
                driverRepository.save(driver);
            }

            return ResponseEntity.ok(Map.of("message", "Rating submitted successfully", "rating", rating));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

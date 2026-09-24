package com.urbanride.controller;

import com.urbanride.entity.Driver;
import com.urbanride.entity.FareConfig;
import com.urbanride.entity.Ride;
import com.urbanride.entity.User;
import com.urbanride.enums.RideStatus;
import com.urbanride.enums.RideType;
import com.urbanride.repository.DriverRepository;
import com.urbanride.repository.FareConfigRepository;
import com.urbanride.repository.RideRepository;
import com.urbanride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private FareConfigRepository fareConfigRepository;

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        try {
            List<Ride> completedRides = rideRepository.findByStatus(RideStatus.COMPLETED);
            double totalRevenue = completedRides.stream()
                    .mapToDouble(r -> r.getFinalFare() != null ? r.getFinalFare() : r.getEstimatedFare())
                    .sum();

            List<Ride> activeRides = rideRepository.findAll().stream()
                    .filter(r -> r.getStatus() == RideStatus.RIDE_STARTED || r.getStatus() == RideStatus.DRIVER_ASSIGNED || r.getStatus() == RideStatus.DRIVER_ARRIVED)
                    .toList();

            long totalUsers = userRepository.count();
            long onlineDrivers = driverRepository.findByIsOnlineTrue().size();

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalRevenue", Math.round(totalRevenue));
            metrics.put("activeRidesCount", activeRides.size());
            metrics.put("onlineDriversCount", onlineDrivers);
            metrics.put("totalUsersCount", totalUsers);
            metrics.put("completedRidesCount", completedRides.size());

            return ResponseEntity.ok(Map.of("metrics", metrics));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of("users", users));
    }

    @GetMapping("/drivers")
    public ResponseEntity<?> getDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        return ResponseEntity.ok(Map.of("drivers", drivers));
    }

    @GetMapping("/fares")
    public ResponseEntity<?> getFares() {
        List<FareConfig> fares = fareConfigRepository.findAll();
        return ResponseEntity.ok(Map.of("fares", fares));
    }

    @PutMapping("/fares/{rideType}")
    public ResponseEntity<?> updateFare(@PathVariable String rideType, @RequestBody FareConfig config) {
        try {
            RideType type = RideType.valueOf(rideType.toUpperCase());
            FareConfig existing = fareConfigRepository.findByRideType(type).orElse(null);
            if (existing != null) {
                if (config.getBaseFare() != null) existing.setBaseFare(config.getBaseFare());
                if (config.getPerKmFare() != null) existing.setPerKmFare(config.getPerKmFare());
                if (config.getPerMinFare() != null) existing.setPerMinFare(config.getPerMinFare());
                if (config.getMinimumFare() != null) existing.setMinimumFare(config.getMinimumFare());
                fareConfigRepository.save(existing);
                return ResponseEntity.ok(Map.of("message", "Fare updated", "fare", existing));
            } else {
                config.setRideType(type);
                fareConfigRepository.save(config);
                return ResponseEntity.ok(Map.of("message", "Fare created", "fare", config));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
